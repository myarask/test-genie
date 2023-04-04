import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { CircularProgress, Box, Button } from "@mui/material";
import ErrorMessage from "../ErrorMessage";
import { usePermissions, useEntitlements, useFeatureFlags, useOnboarding, } from "../../hooks";
import { useKillerApp } from "./useKillerApp";
import SideNavigation from "./SideNavigation";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom");
jest.mock("@mui/material");
jest.mock("../ErrorMessage");
jest.mock("../../hooks");
jest.mock("./useKillerApp");

describe("SideNavigation", () => {
  beforeAll(() => {
    (usePermissions as jest.Mock).mockReturnValue({});
    (useEntitlements as jest.Mock).mockReturnValue({});
    (useFeatureFlags as jest.Mock).mockReturnValue({});
    (useKillerApp as jest.Mock).mockReturnValue({});
    (useOnboarding as jest.Mock).mockReturnValue({});
    (useAuth0 as jest.Mock).mockReturnValue({});
  });
});