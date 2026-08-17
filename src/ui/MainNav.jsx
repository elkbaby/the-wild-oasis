import { NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineCalendarDays,
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineUsers,
  HiOutlineCalendarDateRange,
  HiOutlineChartBar,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { useHotel } from "../context/HotelContext";
import { PERMISSIONS } from "../features/hotels/permissions";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    transition: all 0.3s;
  }

  /* This works because react-router places the active class on the active NavLink */
  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-800);
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-sm);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-600);
  }
`;

function MainNav() {
  const { can } = useHotel();

  const navigation = [
    {
      to: "/dashboard",
      label: "Home",
      icon: <HiOutlineHome />,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
    {
      to: "/bookings",
      label: "Bookings",
      icon: <HiOutlineCalendarDays />,
      permission: PERMISSIONS.BOOKINGS_VIEW,
    },
    {
      to: "/calendar",
      label: "Room calendar",
      icon: <HiOutlineCalendarDateRange />,
      permission: PERMISSIONS.CALENDAR_VIEW,
    },
    {
      to: "/cabins",
      label: "Cabins",
      icon: <HiOutlineHomeModern />,
      permission: PERMISSIONS.CABINS_VIEW,
    },
    {
      to: "/reports",
      label: "Reports",
      icon: <HiOutlineChartBar />,
      permission: PERMISSIONS.REPORTS_VIEW,
    },
    {
      to: "/audit",
      label: "Audit log",
      icon: <HiOutlineClipboardDocumentList />,
      permission: PERMISSIONS.AUDIT_VIEW,
    },
    {
      to: "/users",
      label: "Users",
      icon: <HiOutlineUsers />,
      permission: PERMISSIONS.USERS_MANAGE,
    },
    {
      to: "/settings",
      label: "Settings",
      icon: <HiOutlineCog6Tooth />,
      permission: PERMISSIONS.SETTINGS_MANAGE,
    },
  ];

  return (
    <nav>
      <NavList>
        {navigation
          .filter((item) => can(item.permission))
          .map((item) => (
            <li key={item.to}>
              <StyledNavLink to={item.to}>
                {item.icon}
                <span>{item.label}</span>
              </StyledNavLink>
            </li>
          ))}
      </NavList>
    </nav>
  );
}

export default MainNav;
