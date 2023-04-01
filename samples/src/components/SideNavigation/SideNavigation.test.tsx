import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { CircularProgress, Box, Button } from "@mui/material";
import ErrorMessage from "../ErrorMessage";
import { usePermissions, useEntitlements, useFeatureFlags, useOnboarding } from "../../hooks";
import { useKillerApp } from "./useKillerApp";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom");
jest.mock("@mui/material");
jest.mock("../ErrorMessage");
jest.mock("../../hooks");
jest.mock("./useKillerApp");