import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <header>
      <div>
        <Link to="/">
          <Dumbbell />
          <span>Gym AI</span>
        </Link>
      </div>
    </header>
  );
}
