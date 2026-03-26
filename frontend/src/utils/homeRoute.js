export function homeRouteForRole(role) {
  return role === "admin" ? "/admin" : "/dashboard";
}
