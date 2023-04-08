import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { CircularProgress, Box, Button } from "@mui/material";
import ErrorMessage from "../ErrorMessage";
import {
  usePermissions,
  useEntitlements,
  useFeatureFlags,
  useOnboarding,
} from "../../hooks"; // Import global hooks, used by more than 1 component
import { useKillerApp } from "./useKillerApp"; // Import local hooks, used by this component

type SideNavigationProps = {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

const SideNavigation = ({ isExpanded, setIsExpanded }: SideNavigationProps) => {
  const permissions = usePermissions();
  const entitlements = useEntitlements();
  const featureFlags = useFeatureFlags();
  const killerApp = useKillerApp();
  const onboarding = useOnboarding();
  const auth0 = useAuth0();

  // Escape Clauses:
  // The mocks in beforeAll must not trigger the escape clauses
  // 1 test for each escape clause
  if (auth0.isLoading) return <CircularProgress />;
  if (auth0.error) return <ErrorMessage />;

  return (
    // No tests for styles
    <Box width={isExpanded ? "200px" : "50px"}>
      {/* 1 test for element interactions */}
      <Link to="/">Home</Link>

      {/* 1 test for access conditions on element */}
      {/* 1 test for restriction conditions on element */}
      {/* 1 test for element interactions */}
      {permissions.canViewStats && <Link to="/stats">Stats</Link>}

      {/* 1 test for access conditions on element */}
      {/* 1 test for restriction conditions on element */}
      {/* 1 test for element interactions */}
      {(permissions.canManageMyOrganization ||
        permissions.canManageMyOrganizationMembers) && (
        <Link to="/my-organization">My Organization</Link>
      )}

      {/* 1 test for access conditions on element */}
      {/* 2 tests for restriction conditions on element */}
      {/* 1 test for element interactions */}
      {isExpanded && permissions.canManageMyOrganizationMembers && (
        <Link to="/my-organization/members">My Organization Members</Link>
      )}

      <hr />

      {/* Note: It is difficult for the script to give appropriate names to unnamed nodes.
      For that reason, the developer should be encouraged to break the parent nodes into smaller 
      components, and test those components. That action would always result in more concise tests. */}
      {/* 1 test.todo for access conditions on parent node */}
      {/* 1 test.todo for restriction conditions on parent node */}
      {entitlements.length && (
        <section>
          <h2>Entitlements</h2>
          {/* 1 test for access conditions on element */}
          {/* 1 test for restriction coditions on element */}
          {/* 1 test for element interactions */}
          {entitlements.includes("sales") && <Link to="/sales">Sales</Link>}

          {/* 1 test for access conditions on element */}
          {/* 1 test for restriction coditions on element */}
          {/* 1 test for element interactions */}
          {entitlements.includes("marketing") && (
            <Link to="/marketing">Marketing</Link>
          )}
        </section>
      )}

      <hr />

      {auth0.isAuthenticated ? (
        /* 1 test for access conditions on element  */
        /* 1 test for restriction conditions on element */
        /* 1 test for element interactions */
        <Button onClick={() => auth0.logout()}>Logout</Button>
      ) : (
        /* 1 test for access conditions on element  */
        /* 1 test for restriction conditions on element */
        /* 1 test for element interactions */
        <Button onClick={() => auth0.loginWithRedirect()}>Login</Button>
      )}

      {/* 1 test for element interactions */}
      <Button onClick={() => setIsExpanded(!isExpanded)}>
        Expand/Collapse
      </Button>

      {/* 1 test for access conditions on element */}
      {/* 1 test for restriction conditions on element */}
      {/* 1 test for element interactions */}
      <Button disabled={!featureFlags.killerApp} onClick={killerApp.launch}>
        Launch Killer App
      </Button>

      {/* 1 test for access conditions on element */}
      {/* 1 test for restriction conditions on element */}
      {!onboarding.isFinished && <p>See onboarding docs</p>}
    </Box>
  );
};

export default SideNavigation;
