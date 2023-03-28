import { Link } from "react-router-dom";

type ResponsiveLinkProps = {
  to: string;
  children?: React.ReactNode;
};

const ResponsiveLink = (props: ResponsiveLinkProps) => {
  // TODO: Render IconButton link if isExpanded is false
  // TODO: Render Link if isExpanded is true

  return <Link {...props} />;
};

export default ResponsiveLink;
