import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const q = query(
        collection(db, 'groups'),
        where('members', 'array-contains', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const groupsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroups(groupsData);
    };
    
    fetchGroups();
  }, []);

  const createGroup = async () => {
    try {
      await addDoc(collection(db, 'groups'), {
        name: newGroupName,
        admin: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        createdAt: new Date(),
      });
      setNewGroupName('');
    } catch (error) {
      alert(error.message);
    }
  };

  const inviteToGroup = async () => {
    try {
      // In a real app, you would look up the user by email
      // and add their UID to the group's members array
      const userDoc = await getDoc(doc(db, 'users', inviteEmail));
      if (userDoc.exists()) {
        const groupRef = doc(db, 'groups', selectedGroup);
        await updateDoc(groupRef, {
          members: arrayUnion(userDoc.id)
        });
        alert('User invited successfully!');
      } else {
        alert('User not found');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      const memberIds = groupDoc.data().members;
      const members = await Promise.all(
        memberIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid));
          return userDoc.data();
        })
      );
      setGroupMembers(members);
    }
  };

  return (
    <div className="groups-container">
      <h2>Your Groups</h2>
      
      <div className="create-group">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name"
        />
        <button onClick={createGroup}>Create Group</button>
      </div>
      
      <div className="group-list">
        {groups.map(group => (
          <div key={group.id} className="group-item">
            <h3>{group.name}</h3>
            <button onClick={() => {
              setSelectedGroup(group.id);
              fetchGroupMembers(group.id);
            }}>
              View Members
            </button>
          </div>
        ))}
      </div>
      
      {selectedGroup && (
        <div className="group-members">
          <h3>Group Members</h3>
          <ul>
            {groupMembers.map((member, index) => (
              <li key={index}>
                <img src={member.photoURL} alt={member.name} />
                <span>{member.name}</span>
              </li>
            ))}
          </ul>
          <div className="invite-member">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Invite by email"
            />
            <button onClick={inviteToGroup}>Invite</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;