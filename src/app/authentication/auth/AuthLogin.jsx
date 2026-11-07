"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Checkbox,
  FormControlLabel,
  Divider,
  InputAdornment,
  Link as MuiLink,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../../(DashboardLayout)/context/authContext";  // Import useAuth

// Icons
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";

// Validation schema (email + password)
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Зөв email оруулна уу")
    .required("Цахим шуудангаа оруулна уу"),
  password: yup.string().required("Нууц үгээ оруулна уу"),
});

const AuthLogin = () => {
  const { login } = useAuth();  // Use our auth context
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // Use the login function from auth context
        const result = await login(values);
        
        if (result.success) {
          toast.success("Амжилттай нэвтэрлээ!");
          
          // Redirect to dashboard after successful login
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          toast.error(result.error || "Нэвтрэхэд алдаа гарлаа!");
        }
      } catch (error) {
        toast.error(error.message || "Нэвтрэхэд алдаа гарлаа!");
      } finally {
        setIsSubmitting(false);
      }
    }    
  });

  return (
    <Box sx={{ width: "100%" }}>
      <ToastContainer />

      {/* Heading: Нэвтрэх */}
      <Typography variant="h5" fontWeight="bold" mb={1} sx={{ color: "#333" }}>
        Нэвтрэх
      </Typography>

      {/* Subtext */}
      <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
        Та Монгол Улсын Их Сургуулийн <b>Эмнэлгийн Системд</b> тавтай морилно уу? v6.0.3
      </Typography>

      {/* "СиСи эрхээр нэвтрэх" Button */}
      <Button
        variant="outlined"
        fullWidth
        sx={{
          mb: 3,
          textTransform: "none",
          borderColor: "#ddd",
          color: "#333",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#fafafa",
            borderColor: "#ccc",
          },
        }}
        onClick={() => {
          // Example: redirect to Sisi login route
          window.location.href = "https://sisi.num.edu.mn";
        }}
      >
        СиСи эрхээр нэвтрэх
      </Button>

      {/* Divider with "ЭСВЭЛ" */}
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: "#999" }}>
          ЭСВЭЛ
        </Typography>
      </Divider>

      {/* Form Fields */}
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          {/* Email */}
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Цахим шуудан"
            variant="outlined"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Нууц үг */}
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Нууц үг"
            variant="outlined"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* "Намайг сана" + "Нууц үг мартсан?" */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Намайг сана"
              sx={{ color: "#333" }}
            />
            <MuiLink
              component={Link}
              href="/"
              underline="none"
              sx={{ color: "primary.main", fontSize: "0.875rem" }}
            >
              Нууц үг мартсан?
            </MuiLink>
          </Box>

          {/* Нэвтрэх Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              fontWeight: "none",
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Нэвтрэх"
            )}
          </Button>
        </Stack>
      </form>

      {/* Registration Link */}
      <Box textAlign="center" mt={3}>
        <Typography variant="body2" component="span" sx={{ color: "#666" }}>
          Гишүүн болж амжаагүй байна уу?{" "}
        </Typography>
        <Typography
          variant="body2"
          component={Link}
          href="/authentication/register"
          sx={{
            textDecoration: "none",
            color: "primary.main",
            fontWeight: 500,
          }}
        >
          Бүртгүүлэх
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLogin;