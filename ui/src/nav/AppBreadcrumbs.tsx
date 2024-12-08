import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useLocation, Link } from "react-router-dom";

function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  event.preventDefault();
  console.info("You clicked a breadcrumb.");
}

interface BreadcrumbsProps {
  menus: Array<{
    key: string;
    label: string;
    children?: Array<{
      key: string;
      label: string;
    }>;
  }>;
  homeName: string;
}

export default ({ menus = [], homeName }: BreadcrumbsProps) => {
  const location = useLocation();

  const breadcrumbs = React.useMemo(() => {
    const cBreads = [
      <MuiLink
        underline="hover"
        key="1"
        color="inherit"
        component={Link}
        to="/"
      >
        {homeName}
      </MuiLink>,
    ];
    const cpath = location.pathname.substring(1);
    menus.forEach((el) => {
      if (el.key === cpath) {
        cBreads.push(
          <MuiLink
            underline="hover"
            key="2"
            color="inherit"
            component={Link}
            to={location.pathname}
          >
            {el.label}
          </MuiLink>
        );
      } else if (el.children) {
        el.children.forEach((cel) => {
          if (cel.key === cpath) {
            cBreads.push(
              <MuiLink underline="none" key="2" color="inherit">
                {el.label}
              </MuiLink>
            );
            cBreads.push(
              <MuiLink
                underline="hover"
                key="3"
                color="inherit"
                component={Link}
                to={location.pathname}
              >
                {cel.label}
              </MuiLink>
            );
          }
        });
      }
    });
    return cBreads;
  }, [location, menus]);

  return (
    <Stack spacing={2}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs}
      </Breadcrumbs>
    </Stack>
  );
};
