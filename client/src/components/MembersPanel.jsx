import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeMember } from "../redux/slices/workspaceSlice";
import toast from "react-hot-toast";
import { Crown, Shield, User, Trash2, UserPlus } from "lucide-react";
import InviteMemberModal from "./InviteMemberModal";

export default function MembersPanel() {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { user } = useSelector((state) => state.auth);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const currentUserMember = currentWorkspace?.members.find(
    (m) => m.user._id === user?.id
  );

  const isAdminOrOwner =
    currentUserMember?.role === "admin" ||
    currentUserMember?.role === "owner";

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    const result = await dispatch(
      removeMember({
        workspaceId: currentWorkspace._id,
        memberId,
      })
    );

    if (result.type === "workspace/removeMember/fulfilled") {
      toast.success("Member removed successfully");
    } else {
      toast.error(result.payload || "Failed to remove member");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      owner:
        "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      admin: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      member:
        "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[role]}`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (!currentWorkspace) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-10 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          Select a workspace to view members
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Team Members
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {currentWorkspace.members.length} member
              {currentWorkspace.members.length !== 1 ? "s" : ""}
            </p>
          </div>

          {isAdminOrOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2
                         bg-blue-600 hover:bg-blue-500
                         text-white px-5 py-2.5 rounded-xl
                         font-semibold shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          )}
        </div>

        {/* Members Grid */}
        <div className="grid gap-4">
          {currentWorkspace.members.map((member) => (
            <div
              key={member.user._id}
              className="
                bg-slate-50 dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                rounded-xl p-5
                flex items-center justify-between
                hover:shadow-md transition
              "
            >
              {/* Left */}
              <div className="flex items-center gap-4">
                
                {/* Avatar */}
                <div className="
                  w-12 h-12
                  bg-gradient-to-br from-blue-500 to-purple-600
                  rounded-full flex items-center justify-center
                  text-white font-bold shadow-md
                ">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {member.user.name}
                      {member.user._id === user?._id && (
                        <span className="text-slate-400 font-normal ml-2 text-sm">
                          (You)
                        </span>
                      )}
                    </p>
                    {getRoleIcon(member.role)}
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {member.user.email}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Joined{" "}
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-4">
                {getRoleBadge(member.role)}

                {isAdminOrOwner &&
                  member.role !== "owner" &&
                  member.user._id !== user?._id && (
                    <button
                      onClick={() =>
                        handleRemoveMember(member.user._id)
                      }
                      className="
                        text-red-500 hover:text-red-400
                        transition p-2 rounded-lg
                        hover:bg-red-500/10
                      "
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
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </>
  );
}
