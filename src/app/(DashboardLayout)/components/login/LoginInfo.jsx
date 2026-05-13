"use client";
import React from "react";
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Grid } from "@mui/material";
import VerifiedIcon from '@mui/icons-material/Verified';
import Image from "next/image";

const LoginInfo = () => {
  const benefits = [
    "Сургуулийн цахим шуудангаар нэвтрэх",
    "Өөрийн онош мэдээллийг харах боломж",
    "Өөрийн эмчилгээний түүхийг харах",
    
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: 900, p: 2, mx: "auto" }}>
      <Grid container spacing={2}>
        {/* Row 1: MUIS Logo (centered) */}
        <Grid item xs={12} textAlign="center">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logos/muislogo.png`}
            alt="MUIS Logo"
            width={330}
            height={150}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Grid>

        {/* Row 2: Doctor image (left), bullet points + info (right) */}
        <Grid item xs={12} sm={4} textAlign="end" mt={5}>
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logos/emch.png`}
            alt="Doctor"
            width={150}
            height={290}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Grid>

        <Grid item xs={12} sm={8}>
          <Box textAlign="left">
            <Typography variant="body1" mt={2}>
              Та Монгол Улсын Их Сургуулийн <b>Эмнэлгийн системийг</b> ашигласнаар дараах давуу талуудыг эдлэнэ:
            </Typography>

            <List sx={{ mt: 1 }}>
              {benefits.map((benefit, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <VerifiedIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" fontWeight="bold" mt={2}>
              Холбогдох утас: 7575-4400
            </Typography>

            <Typography variant="body2" color="textSecondary" mt={10}>
              2025 © Бүх эрх хуулиар хамгаалагдсан.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginInfo;
