import ProfileButton from "./ProfileButton";
import LogoutButton from "./LogoutButton";

const AdminHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>

      <div className="flex gap-4">
        <ProfileButton />
        <LogoutButton />
      </div>
    </div>
  );
};

export default AdminHeader;
