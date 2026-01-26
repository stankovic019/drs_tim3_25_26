import { useEffect, useState } from "react";
import { fetchAllUsers, updateUserRole, deleteUser } from "../api/dashboardApi";
import ConfirmationDialog from "./ConfirmationDialog";

const formatDateSerbian = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to load users");
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      setError("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    setUserToDelete(userId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(userToDelete);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
      setShowConfirmDialog(false);
      setUserToDelete(null);
    } catch (err) {
      setError("Failed to delete user");
      setShowConfirmDialog(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setUserToDelete(null);
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-6">
        <div className="border-2 border-[#353a7c] rounded-xl bg-white shadow-[5px_5px_#353a7c] p-6 flex items-start gap-3">
          <div>
            <p className="text-lg font-bold text-[#353a7c]">
              Failed to load users
            </p>
            <p className="text-sm text-[#666]">
              Please refresh the page or try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-3 bg-[linear-gradient(45deg,#efad21,#ffd60f)] border-[#353a7c] rounded-xl shadow-[5px_5px_#353a7c] p-5">
        <div className="overflow-x-auto">
          <table className="border-collapse w-full">
            <thead>
              <tr className="bg-[#fff]">
                <th className="px-4 py-3 text-center text-sm font-bold text-[#353a7c] border-2 border-[#353a7c]">

                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#353a7c] border-2 border-[#353a7c]">
                  First Name
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#353a7c] border-2 border-[#353a7c]">
                  Last Name
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#353a7c] border-2 border-[#353a7c]">
                  Birthday
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#353a7c] border-2 border-[#353a7c]">
                  Email
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#353a7c] border-2 border-[#353a7c]">
                  Role
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#353a7c] border-2 border-[#353a7c]">
                  Country
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#353a7c] border-2 border-[#353a7c]">
                  Created At
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#353a7c] border-2 border-[#353a7c]">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-8 text-center text-[#666] font-semibold border-2 border-[#353a7c] bg-[#fff]"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-[#fff] transition-all duration-200 hover:bg-[#f5f5f5]"
                  >
                    <td className="px-4 py-2 text-sm text-[#666] font-semibold border-2 border-[#353a7c] text-center">
                      <img
                        src={user.profileImage}
                        alt="NoImage"
                        className="max-w-[100px] aspect-square rounded-md mx-auto"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666] font-semibold border-2 border-[#353a7c] text-center">
                      {user.firstName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666] font-semibold border-2 border-[#353a7c] text-center">
                      {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666] font-semibold border-2 border-[#353a7c] text-center">
                      {formatDateSerbian(user.birthDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666] font-semibold border-2 border-[#353a7c] text-center">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 border-2 border-[#353a7c] text-center">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="w-full h-[40px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 cursor-pointer focus:border-[#efad21] focus:shadow-[4px_4px_#efad21] text-center"
                      >
                        <option value="PLAYER">PLAYER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666] font-semibold border-2 border-[#353a7c] text-center">
                      {user.country}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#666] font-semibold border-2 border-[#353a7c] text-center">
                      {formatDateSerbian(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 border-2 border-[#353a7c] text-center">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="relative overflow-hidden w-full h-[40px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#9b0101] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#c80404] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
