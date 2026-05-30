import { Navigate } from "react-router-dom";

/** Legacy URL — same layout as category page with carousel + products first */
export default function AccessoriesPage() {
  return <Navigate to="/category/accessories" replace />;
}
