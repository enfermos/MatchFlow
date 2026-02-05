import { getSession } from "./api.js";

export const protectRoute = (
  routeType = "private",
  allowedRoles = [],
  redirectUrl = null,
) => {
  const session = getSession();
  const currentPath = window.location.pathname;

  const defaultRedirects = {
    public_not_authorized: "./dashboard.html",
    private_not_auth: "./index.html",
    restricted_not_authorized: "./dashboard.html",
  };

  if (routeType === "public") {
    if (session) {
      const targetUrl = redirectUrl || defaultRedirects.public_not_authorized;
      window.location.href = targetUrl;
      return false;
    }
    return true;
  }

  if (routeType === "private") {
    if (!session) {
      const targetUrl = redirectUrl || defaultRedirects.private_not_auth;
      window.location.href = targetUrl;
      return false;
    }
    return true;
  }

  if (routeType === "restricted") {
    if (!session) {
      const targetUrl = redirectUrl || defaultRedirects.private_not_auth;
      window.location.href = targetUrl;
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      const targetUrl =
        redirectUrl || defaultRedirects.restricted_not_authorized;
      window.location.href = targetUrl;
      return false;
    }
    return true;
  }

  return true;
};

export const hasRole = (role) => {
  const session = getSession();
  return session && session.role === role;
};

export const isAuthenticated = () => {
  return getSession() !== null;
};

export const protectElements = (selector, allowedRoles) => {
  const session = getSession();
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    if (!session || !allowedRoles.includes(session.role)) {
      element.style.display = "none";
    } else {
      element.style.display = "";
    }
  });
};

export const ROUTES = {
  LOGIN: { type: "public", redirectUrl: "./dashboard.html" },
  REGISTER: { type: "public", redirectUrl: "./dashboard.html" },
  DASHBOARD: { type: "private" },
  ADMIN_FUNCTIONS: { type: "restricted", allowedRoles: ["admin"] },
};

export const protect = (routeName) => {
  const route = ROUTES[routeName];
  if (!route) {
    console.warn(`Route ${routeName} not found in ROUTES configuration`);
    return false;
  }

  return protectRoute(route.type, route.allowedRoles || [], route.redirectUrl);
};
