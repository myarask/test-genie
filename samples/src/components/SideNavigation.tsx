import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { CircularProgress, Box, Divider, Button } from "@mui/material";
import ErrorMessage from "./ErrorMessage";
import { usePermissions } from "../hooks/usePermissions";
import { useEntitlements } from "../hooks/useEntitlements";

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

  // Escape Clauses:
  // The mocks in beforeAll must not trigger the escape clauses
  // 1 test for each escape clause
  if (auth0.isLoading) return <CircularProgress />;
  if (auth0.error) return <ErrorMessage />;

  return (
    // No tests for styles
    <Box width={isExpanded ? "200px" : "50px"}>
      {/* 1 test for shallow interactive element */}
      <Link to="/">Home</Link>

      {/* 1 test for conditional rendering, access conditions */}
      {/* 1 test for conditional rendering, restriction conditions */}
      {/* 1 test for shallow interactive element */}
      {permissions.canViewStats && <Link to="/stats">Stats</Link>}

      {/* 1 test for conditional rendering, access conditions */}
      {/* 1 test for conditional rendering, restriction conditions */}
      {/* 1 test for shallow interactive element */}
      {permissions.canManageMyOrganization && (
        <Link to="/my-organization">My Organization</Link>
      )}

      {/* 1 test for conditional rendering, access conditions */}
      {/* 2 tests for conditional rendering, restriction conditions */}
      {/* 1 test for shallow interactive element */}
      {isExpanded && permissions.canManageMyOrganizationMembers && (
        <Link to="/my-organization/members">My Organization Members</Link>
      )}

      <Divider />
      {/* 1 test.todo for conditional rendering on parent node, access conditions */}
      {/* 1 test.todo for conditional rendering on parent node, restriction conditions */}
      {entitlements.length && (
        <section>
          <h2>Entitlements</h2>
          {/* 1 test.todo for conditional rendering on deep node, access conditions */}
          {/* 1 test.todo for conditional rendering on deep node, restriction conditions */}
          {/* 1 test.todo for deep interactive element */}
          {entitlements.includes("sales") && <Link to="/sales">Sales</Link>}

          {/* 1 test.todo for conditional rendering on deep node, access conditions */}
          {/* 1 test.todo for conditional rendering on deep node, restriction conditions */}
          {/* 1 test.todo for deep interactive element */}
          {entitlements.includes("marketing") && (
            <Link to="/marketing">Marketing</Link>
          )}

          {/* 1 test.todo for conditional rendering on deep node, access conditions */}
          {/* 1 test.todo for conditional rendering on deep node, restriction conditions */}
          {/* 1 test.todo for deep interactive element */}
          {entitlements.includes("finance") && (
            <Link to="/finance">Finance</Link>
          )}
        </section>
      )}
      <Divider />
      {auth0.isAuthenticated ? (
        /* 1 test for conditional rendering, access conditions */
        /* 1 test for conditional rendering, restriction conditions */
        /* 1 test for shallow interactive element */
        <Button onClick={() => auth0.logout()}>Logout</Button>
      ) : (
        /* 1 test for conditional rendering, access conditions */
        /* 1 test for conditional rendering, restriction conditions */
        /* 1 test for shallow interactive element */
        <Button onClick={() => auth0.loginWithRedirect()}>Login</Button>
      )}
      {/* 1 test for shallow interactive element */}
      <Button onClick={() => setIsExpanded(!isExpanded)}>
        Expand/Collapse
      </Button>
    </Box>
  );
};
