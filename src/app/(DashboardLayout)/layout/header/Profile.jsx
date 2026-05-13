import React, { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { IconUser } from "@tabler/icons-react";
import { useAuth } from "../../context/authContext";

const Profile = () => {
  const { user, logout } = useAuth(); // Use the logout function from auth context

  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  // Handle logout click
  const handleLogout = () => {
    logout(); // Use the logout function from the auth context
  };

  return (
    <Box>
      <IconButton
        size="large"
        color="inherit"
        aria-controls="profile-menu"
        aria-haspopup="true"
        sx={{
          ...(Boolean(anchorEl2) && { color: "primary.main" }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={user?.user?.avatar || `${process.env.NEXT_PUBLIC_BASE_PATH}/images/profile/user-1.jpg`}
          alt="User Avatar"
          sx={{ width: 35, height: 35 }}
        />
      </IconButton>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{ "& .MuiMenu-paper": { width: "200px" } }}
      >
        <MenuItem>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>Хувийн мэдээлэл</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button variant="outlined" color="primary" fullWidth onClick={handleLogout}>
            Гарах
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;