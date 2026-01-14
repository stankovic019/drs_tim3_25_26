import { useEffect, useState } from "react";
import { fetchAllUsers, updateUserRole } from "../api/dashboardApi";

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
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
