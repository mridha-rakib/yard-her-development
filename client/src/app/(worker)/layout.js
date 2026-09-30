import Navbar from "../component/shared/Navbar";

export default function HeroLayout({ children }) {
  return (
    <>
    {/* <Navbar/> */}
      <main>{children}</main>
    </>
  );
}
