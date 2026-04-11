import { uniqueId } from "lodash";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SickIcon from "@mui/icons-material/Sick";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import SummarizeIcon from "@mui/icons-material/Summarize";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

/**
 * Menu items configuration with role-based and position-based access control
 * @param {Object} user - The current user object
 * @returns {Array} - Array of menu items filtered by user role and position
 */
const Menuitems = (user) => {
  const medicalStaffPositions = ["Doctor", "Nurse"];

  const normalizePosition = (position) => {
    if (!position || typeof position !== "string") {
      return "";
    }

    const trimmed = position.trim().toLowerCase();
    if (trimmed === "doctor") return "Doctor";
    if (trimmed === "nurse") return "Nurse";

    return position.trim();
  };

  // Define all menu items with role and position access rules
  const allMenuItems = [
    {
      id: uniqueId(),
      title: "Хянах самбар",
      icon: DashboardIcon,
      href: "/",
      roles: ["Admin", "MedicalStaff"],
      positions: ["Doctor", "Nurse"] // Both doctor and nurse can see this
    },
    {
      id: uniqueId(),
      title: "Сувилагчийн самбар",
      icon: LocalHospitalIcon,
      href: "/",
      roles: ["MedicalStaff"],
      positions: ["Nurse"] // Only nurses see this
    },
    {
      id: uniqueId(),
      title: "Өвчтөний самбар",
      icon: SickIcon,
      href: "/",
      roles: ["Patient"] // Only patients see this
    },
    {
      id: uniqueId(),
      title: "Амин үзүүлэлт",
      icon: BloodtypeIcon,
      href: "/vitals",
      roles: ["Admin", "MedicalStaff"],
      positions: ["Doctor", "Nurse"] // Both doctor and nurse can see this
    },
    {
      id: uniqueId(),
      title: "Эмчилгээ",
      icon: VaccinesIcon,
      href: "/treatment",
      roles: ["Admin", "MedicalStaff"],
      positions: ["Doctor", "Nurse"] // Both can see this
    },
    {
      id: uniqueId(),
      title: "Үйлчлүүлэгч",
      icon: SickIcon,
      href: "/customer",
      roles: ["Admin", "MedicalStaff"],
      positions: ["Doctor", "Nurse"] // Both can see this
    },
    {
      id: uniqueId(),
      title: "Материал зарцуулалт",
      icon: MedicalServicesOutlinedIcon,
      href: "/pharmacy",
      roles: ["Admin", "MedicalStaff"],
      positions: ["Nurse"] // Only nurses see this
    },
    {
      id: uniqueId(),
      title: "Тайлан",
      icon: SummarizeIcon,
      href: "/report",
      roles: ["Admin", "MedicalStaff"],
      positions: ["Doctor"] // Only doctors see this
    },
    {
      id: uniqueId(),
      title: "Үзлэг",
      icon: MedicalServicesIcon,
      href: "/examination",
      roles: ["Admin", "MedicalStaff"],
      positions: ["Doctor"] // Only doctors see this
    },
    {
      id: uniqueId(),
      title: "Ажилтан",
      icon: PersonIcon,
      href: "/employee",
      roles: ["Admin"] // Only admin sees this
    },
  ];

  // If no user is provided, or user doesn't have a role, return empty array
  if (!user || !user.user || !user.user.role) {
    return [];
  }

  // Get user role and position
  const userRole = user.user.role;
  const userPosition = normalizePosition(user.user.position);

  console.log("MenuItems userRole:", userRole);
console.log("MenuItems userPosition:", userPosition);

  // Filter menu items based on user role and position
  const filteredItems = allMenuItems.filter(item => {
    // First, check if the role matches
    const roleMatches = item.roles && item.roles.includes(userRole);
    
    // If not a medical staff or item doesn't specify positions, just check role
    if (userRole !== "MedicalStaff" || !item.positions) {
      return roleMatches;
    }
    
    // If position is missing, still show medical-staff items that are shared by
    // every supported medical-staff position so common navigation does not disappear.
    if (!userPosition) {
      return (
        roleMatches &&
        medicalStaffPositions.every((position) => item.positions.includes(position))
      );
    }

    // For medical staff, also check if their position is allowed
    return roleMatches && item.positions.includes(userPosition);
  });

  // Add section header only if there are filtered items
  if (filteredItems.length > 0) {
    return [
      {
        navlabel: true,
        subheader: "Үндсэн цэс",
      },
      ...filteredItems
    ];
  }

  return filteredItems;
};

export default Menuitems;
