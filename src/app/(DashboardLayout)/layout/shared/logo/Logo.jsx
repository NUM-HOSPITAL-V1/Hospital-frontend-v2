import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  height: "57px",
  width: "200px",
  overflow: "hidden",
  display: "block",
}));

const Logo = () => {
  return (
    <LinkStyled href="/">
      <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logos/emnelegLogo.png`} alt="logo" height={55} width={190} priority />
    </LinkStyled>
  );
};

export default Logo;
  