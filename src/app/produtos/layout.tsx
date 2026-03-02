import LayoutUser from "@/components/LayoutUser";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutUser>{children}</LayoutUser>;
}