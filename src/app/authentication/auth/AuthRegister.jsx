"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  MenuItem,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../../(DashboardLayout)/context/authContext";

// MUI Icons
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BadgeIcon from "@mui/icons-material/Badge";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";

const SCHOOL_OPTIONS = [
  "ШУТ UB парк ",
  "УТОУХНУС ",
  "ИТС",
  "МТЭС",
  "ШУС",
  "ХЗС",
  "БС",
  "АТС",
];

const AuthRegister = ({ title, subtitle, subtext }) => {
  const { register } = useAuth();  // Use our auth context
  const router = useRouter();
  
  // 3 алхмын төлөв
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Хэрэглэгчийн төрөл, формын талбарууд
  const [type, setType] = useState("");
  const [surname, setSurname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [sisiID, setSisiID] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 3-р алхамд авах талбарууд
  const [birthOfDate, setBirthOfDate] = useState("");
  const [gender, setGender] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [registerNumberError, setRegisterNumberError] = useState("");
  const [emailError, setEmailError] = useState("");

  const isValidPhoneNumber = (number) => {
    const mongolianPhoneRegex = /^\+976[89][0-9]{7}$|^[89][0-9]{7}$/;
    return mongolianPhoneRegex.test(number);
  };

  const isValidPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,}$/.test(password);
  };

  // Mongolian register should have 2 Cyrillic letters (including Ө, Ү) followed by 8 digits.
  const isValidRegisterNumber = (number) => {
    return /^[А-ЯЁӨҮ]{2}\d{8}$/i.test(number);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    setPhoneError(isValidPhoneNumber(value) ? "" : "Утасны дугаар буруу байна!");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(
      isValidPassword(value)
        ? ""
        : "Нууц үг 8+ тэмдэгттэй, том үсэг, тоо, тусгай тэмдэгт агуулах ёстой!"
    );
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value === password ? "" : "Нууц үг таарахгүй байна!");
  };

  const handleRegisterNumberChange = (e) => {
    const value = e.target.value;
    setRegisterNumber(value);
    setRegisterNumberError(isValidRegisterNumber(value) ? "" : "Регистрийн дугаар буруу байна!");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(isValidEmail(value) ? "" : "Цахим шуудан буруу байна!");
  };

  // Алхам урагшлах, ухрах
  const handleNext = () => {
    if (step === 1) {
      // Эхний алхамд зөвхөн төрөл сонгосны дараа дараагийн алхам руу шилжих
      setStep((prev) => prev + 1);
      return;
    }
    if (step === 2) {
      // Алхам 2 дахь талбаруудын валидаци
      if (!isValidPhoneNumber(phone)) {
        setPhoneError("Утасны дугаар буруу байна!");
        return;
      }
      if (!isValidPassword(password)) {
        setPasswordError("Нууц үг шаардлагыг хангахгүй байна!");
        return;
      }
      if (password !== confirmPassword) {
        setConfirmPasswordError("Нууц үг таарахгүй байна!");
        return;
      }
      setStep((prev) => prev + 1);
      return;
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  // Төрлөө сонгох
  const handleSelectType = (value) => {
    setType(value);
  };

  // --- Register Number Decoding ---  
  // Expected register format: 7 digits: yy mm dd x
  // If mm > 20 then: year = 2000 + yy and month = mm - 20; else year = 1900 + yy and month = mm.
  // Gender: odd digit -> "male", even digit -> "female".
  const decodeRegister = (reg) => {
    if (!reg || reg.length !== 10) return null;
    const yy = parseInt(reg.slice(2, 4), 10);
    const mm = parseInt(reg.slice(4, 6), 10);
    const dd = parseInt(reg.slice(6, 8), 10);
    const genderDigit = parseInt(reg.slice(8, 9), 10);
    let year, month;
    if (mm > 20) {
      year = 2000 + yy;
      month = mm - 20;
    } else {
      year = 1900 + yy;
      month = mm;
    }
    const monthStr = month.toString().padStart(2, "0");
    const dayStr = dd.toString().padStart(2, "0");
    const birthOfDateDecoded = `${year}-${monthStr}-${dayStr}`;
    const genderDecoded = (genderDigit % 2 === 0) ? "female" : "male";
    return { birthOfDate: birthOfDateDecoded, gender: genderDecoded };
  };

  // Whenever the register number changes, decode it if it has 7 digits.
  useEffect(() => {
    if (registerNumber.length === 10) {
      const decoded = decodeRegister(registerNumber);
      if (decoded) {
        setBirthOfDate(decoded.birthOfDate);
        setGender(decoded.gender);
      }
    }
  }, [registerNumber]);


  // Эцсийн бүртгэл илгээх
  const handleSubmit = async () => {
    if (!isValidRegisterNumber(registerNumber)) {
      setRegisterNumberError("Регистрийн дугаар буруу байна!");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Цахим шуудан буруу байна!");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Map surname to lastname and phone to phoneNumber, etc.
      const formData = {
        type,
        firstname,
        lastname: surname,
        sisiID,
        phoneNumber: phone,
        password,
        register: registerNumber,
        school,
        email,
        address,
        occupation,
        education,
        birthOfDate,
        gender,
      };
      
      // Use the register function from auth context
      const result = await register(formData);
      
      if (result.success) {
        toast.success("Амжилттай бүртгэгдлээ!");
        // Redirect after a delay
        setTimeout(() => {
          router.push("/authentication/login");
        }, 2000);
      } else {
        toast.error(result.error || "Бүртгэлд алдаа гарлаа!");
      }
    } catch (error) {
      toast.error(error.message || "Алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Заавал бөглөх талбарын улаан *
  const requiredAsteriskStyle = {
    "& .MuiInputLabel-asterisk": { color: "red" },
  };

  // MUI Stepper-д харуулах шошго
  const steps = ["Төрөл сонгох", "Мэдээлэл бөглөх", "Нэмэлт мэдээлэл"];

  return (
    <Box sx={{ width: "100%", mx: "auto", p: 2, maxWidth: 600 }}>
      {/* ToastContainer should be rendered at the top level */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {title && (
        <Typography fontWeight="700" variant="h4" mb={2} textAlign="center">
          {title}
        </Typography>
      )}
      {subtext && <Box textAlign="center" mb={3}>{subtext}</Box>}

      {/* Алхамыг харуулсан Stepper */}
      <Stepper activeStep={step - 1} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Алхам 1: Төрлөө сонгох */}
      {step === 1 && (
        <Box>
          <Typography variant="h6" mb={2} textAlign="center">
            Та аль төрлийн хэрэглэгч вэ?
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {/* Суралцагч */}
            <Grid item xs={12} sm={4} md={3}>
              <Box
                onClick={() => handleSelectType("Student")}
                sx={{
                  border: type === "Student" ? "2px solid #1976d2" : "1px solid #ccc",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <SchoolIcon
                  sx={{
                    fontSize: 40,
                    color: type === "Student" ? "#1976d2" : "inherit",
                  }}
                />
                <Typography mt={1}>Оюутан</Typography>
              </Box>
            </Grid>
            {/* Багш */}
            <Grid item xs={12} sm={4} md={3}>
              <Box
                onClick={() => handleSelectType("Teacher")}
                sx={{
                  border: type === "Teacher" ? "2px solid #1976d2" : "1px solid #ccc",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <MenuBookIcon
                  sx={{
                    fontSize: 40,
                    color: type === "Teacher" ? "#1976d2" : "inherit",
                  }}
                />
                <Typography mt={1}>Багш</Typography>
              </Box>
            </Grid>
            {/* Ажилтан */}
            <Grid item xs={12} sm={4} md={3}>
              <Box
                onClick={() => handleSelectType("Staff")}
                sx={{
                  border: type === "Staff" ? "2px solid #1976d2" : "1px solid #ccc",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <PeopleIcon
                  sx={{
                    fontSize: 40,
                    color: type === "Staff" ? "#1976d2" : "inherit",
                  }}
                />
                <Typography mt={1}>Ажилтан</Typography>
              </Box>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            fullWidth
            onClick={handleNext}
            disabled={!type}
          >
            Дараах
          </Button>
        </Box>
      )}

      {/* Алхам 2: Төрлөөс хамаарч ялгаатай талбарууд */}
      {step === 2 && (
        <Box>
          <Typography variant="h6" mb={2} textAlign="center">
            Таны үндсэн мэдээлэл
          </Typography>
          <Grid container spacing={2}>
            {/* Овог */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Овог"
                name="surname"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Нэр */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Нэр"
                name="firstname"
                required
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Хэрвээ Суралцагч бол Сиси ID */}
            {type === "Student" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Сиси ID"
                  name="sisiID"
                  required
                  value={sisiID}
                  onChange={(e) => setSisiID(e.target.value)}
                  InputLabelProps={{ sx: requiredAsteriskStyle }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            {/* Утасны дугаар */}
            <Grid item xs={12} sm={type === "Student" ? 6 : 12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Утасны дугаар"
                name="phone"
                required
                value={phone}
                onChange={handlePhoneChange}
                error={!!phoneError}
                helperText={phoneError}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Нууц үг */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Нууц үг"
                name="password"
                type="password"
                required
                value={password}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Нууц үг давтах */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Нууц үг давтах"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button variant="outlined" fullWidth onClick={handleBack}>
                Буцах
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleNext}
                disabled={
                  !surname ||
                  !firstname ||
                  !phone ||
                  !password ||
                  !confirmPassword ||
                  (type === "Student" && !sisiID)
                }
              >
                Дараах
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Алхам 3: Нэмэлт (бүгдээс авах) талбарууд */}
      {step === 3 && (
        <Box>
          <Typography variant="h6" mb={2} textAlign="center">
            Нэмэлт мэдээлэл
          </Typography>
          <Grid container spacing={2}>
            {/* Регистрийн дугаар */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Регистрийн дугаар"
                name="registerNumber"
                required
                value={registerNumber}
                onChange={handleRegisterNumberChange}
                error={!!registerNumberError}
                helperText={registerNumberError}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VerifiedUserIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Сургууль */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Сургууль"
                name="school"
                required
                select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {SCHOOL_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.trim()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* Цахим шуудан */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Цахим шуудан"
                name="email"
                required
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Гэрийн хаяг */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Гэрийн хаяг"
                name="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Мэргэжил */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Мэргэжил"
                name="occupation"
                required
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Боловсрол */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Боловсрол"
                name="education"
                required
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                InputLabelProps={{ sx: requiredAsteriskStyle }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button variant="outlined" fullWidth onClick={handleBack}>
                Буцах
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={isSubmitting || !registerNumber || !school || !email}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Бүртгүүлэх"
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {subtitle && (
        <Box textAlign="center" sx={{ mt: 2 }}>
          {subtitle}
        </Box>
      )}
    </Box>  );
};

export default AuthRegister;
