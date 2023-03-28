import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { CircularProgress, Box, Divider, Button } from "@mui/material";
import ErrorMessage from "../components/ErrorMessage";
import Profile from "../components/Profile";
import { usePermissions } from "../hooks/usePermissions.hook";
import { useUserQuery } from "../hooks/generated";

export const SideNavigation = () => {
  const user = useUserQuery();
  const permissions = usePermissions();
  const auth0 = useAuth0();

  if (user.loading) return <CircularProgress />;
  if (user.error) return <ErrorMessage error={user.error} />;

  return (
    <Box>
      {auth0.isAuthenticated && <Profile user={user.data.user} />}
      {permissions.canManageOrg && <Link to="/">Dashboard</Link>}
      <Divider />
      <Button onClick={() => auth0.logout()}>Logout</Button>
    </Box>
  );
};