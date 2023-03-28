import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { CircularProgress, Box, Divider, Button } from "@mui/material";
import ErrorMessage from "./components/ErrorMessage";
import { usePermissions } from "./hooks/usePermissions";
import { useEntitlements } from "./hooks/useEntitlements";

type SideNavigationProps = {
  isExpanded: boolean;
  setIsExpanded: (state: boolean) => boolean;
};

export const SideNavigation = ({
  isExpanded,
  setIsExpanded,
}: SideNavigationProps) => {
  const permissions = usePermissions();
  const entitlements = useEntitlements();
  const auth0 = useAuth0();

  if (auth0.isLoading) return <CircularProgress />;
  if (auth0.error) return <ErrorMessage />;

  return (
    <Box width={isExpanded ? "200px" : "50px"}>
      <Link to="/">Home</Link>
      {permissions.canViewStats && <Link to="/stats">Stats</Link>}
      {permissions.canManageMyOrganization && (
        <Link to="/my-organization">My Organization</Link>
      )}
      {permissions.canManageMyOrganization &&
        permissions.canManageMyOrganizationMembers && (
          <Link to="/my-organization/members">My Organization Members</Link>
        )}
      <Divider />
      {entitlements.length && (
        <section>
          <h2>Entitlements</h2>
          {entitlements.includes("sales") && <Link to="/sales">Sales</Link>}
          {entitlements.includes("marketing") && (
            <Link to="/marketing">Marketing</Link>
          )}
          {entitlements.includes("finance") && (
            <Link to="/finance">Finance</Link>
          )}
        </section>
      )}
      <Divider />
      {auth0.isAuthenticated ? (
        <Button onClick={() => auth0.logout()}>Logout</Button>
      ) : (
        <Button onClick={() => auth0.loginWithRedirect()}>Login</Button>
      )}
      <Button onClick={() => setIsExpanded(!isExpanded)}>
        Expand/Collapse
      </Button>
    </Box>
  );
};
