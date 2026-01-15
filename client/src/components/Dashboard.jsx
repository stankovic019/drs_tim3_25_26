import { useEffect, useState } from "react";
import { fetchAllUsers, updateUserRole, deleteUser } from "../api/dashboardApi";

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

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

            // update lokalnog state-a da se odmah vidi promena
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (err) {
            console.error("Failed to update role", err);
            setError("Failed to update role");
        }
    };

    const handleDeleteUser = async (userId) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (!confirmed) return;

        try {
            await deleteUser(userId);

            // ukloni korisnika iz tabele odmah
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
            console.error("Failed to delete user", err);
            setError("Failed to delete user");
        }
    };


    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>All Users</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Birthday</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Country</th>
                        <th>Created At</th>
                        <th>Delete</th>

                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="8">No users found</td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.birthDate}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) =>
                                            handleRoleChange(user.id, e.target.value)
                                        }
                                    >
                                        <option value="PLAYER">PLAYER</option>
                                        <option value="MODERATOR">MODERATOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </td>
                                <td>{user.country}</td>
                                <td>{user.createdAt}</td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        style={{
                                            background: "red",
                                            color: "white",
                                            border: "none",
                                            padding: "4px 8px",
                                            cursor: "pointer",
                                        }}
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
    );
}
