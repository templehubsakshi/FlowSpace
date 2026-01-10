import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeMember } from '../redux/slices/workspaceSlice';
import toast from 'react-hot-toast';
import { Crown, Shield, User, Trash2, UserPlus } from 'lucide-react';
import InviteMemberModal from './InviteMemberModal';

export default function MembersPanel() {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { user } = useSelector((state) => state.auth);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const currentUserMember = currentWorkspace?.members.find(
    m => m.user._id === user?.id
  );
  const isAdminOrOwner = currentUserMember?.role === 'admin' || currentUserMember?.role === 'owner';

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    const result = await dispatch(removeMember({
      workspaceId: currentWorkspace._id,
      memberId
    }));

    if (result.type === 'workspace/removeMember/fulfilled') {
      toast.success('Member removed successfully');
    } else {
      toast.error(result.payload || 'Failed to remove member');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      owner: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (!currentWorkspace) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-500">Select a workspace to view members</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
            <p className="text-gray-600 text-sm mt-1">
              {currentWorkspace.members.length} member{currentWorkspace.members.length !== 1 ? 's' : ''}
            </p>
          </div>

          {isAdminOrOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {currentWorkspace.members.map((member) => (
            <div
              key={member.user._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">
                      {member.user.name}
                      {member.user._id === user?.id && (
                        <span className="text-gray-500 font-normal ml-2">(You)</span>
                      )}
                    </p>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-sm text-gray-600">{member.user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Role Badge & Actions */}
              <div className="flex items-center gap-3">
                {getRoleBadge(member.role)}

                {isAdminOrOwner && 
                 member.role !== 'owner' && 
                 member.user._id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.user._id)}
                    className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInviteModal && (
        <InviteMemberModal onClose={() => setShowInviteModal(false)} />
)}
</>
);
}