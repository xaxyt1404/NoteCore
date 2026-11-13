import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { mockUser } from "../mocks/dashboardMocks";

const NAVIGATION = {
  main: [{ id: "view-admin-inicio", icon: "fa-house", label: "Inicio" }],
  bottom: [],
};

export default function DashboardAdmin() {
  const navigate = useNavigate();

  return (
    <DashboardLayout
      navigation={NAVIGATION}
      activeView="view-admin-inicio"
      user={mockUser}
      onLogout={() => navigate("/")}
    >
      <section id="view-admin-inicio" className="dash-view active"></section>
    </DashboardLayout>
  );
}