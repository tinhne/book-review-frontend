import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV_LINKS = [{ to: "/", label: "Trang chủ", end: true }] as const;

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogout = useCallback(() => {
    logout();
    toast.success("Đã đăng xuất");
    navigate("/");
    closeMenu();
  }, [logout, navigate, closeMenu]);

  // Fix: dùng useEffect đúng cách — lắng nghe keydown từ external system (DOM)
  // Đây là trường hợp hợp lệ: subscribe external event → setState trong callback
  useEffect(() => {
    if (!menuOpen) return; // Không cần listener khi menu đóng

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false); // setState trong callback → OK
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown); // cleanup
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
            onClick={closeMenu}
          >
            <BookOpen className="text-primary" size={24} />
            <span>BookReview</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "text-sm transition-colors hover:text-foreground",
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Link Admin — chỉ hiện khi là admin */}
            {isAuthenticated && isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )
                }
              >
                Admin Panel
              </NavLink>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user?.username}
                  </span>
                  {isAdmin && (
                    <Badge
                      variant="default"
                      className="text-[10px] px-1.5 py-0 gap-0.5"
                    >
                      <ShieldCheck size={10} /> Admin
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut size={13} /> Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — đóng bằng cách click từng link, không dùng effect */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                // onClick trực tiếp trên NavLink — không cần effect
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    "py-2.5 px-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated && isAdmin && (
              <NavLink
                to="/admin"
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    "py-2.5 px-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )
                }
              >
                Admin Panel
              </NavLink>
            )}

            <Separator className="my-2" />

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 py-2 px-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-xs">
                      {user?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {user?.username}
                  </span>
                  {isAdmin && (
                    <Badge variant="default" className="text-[10px] ml-auto">
                      Admin
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1"
                  onClick={handleLogout}
                >
                  <LogOut size={13} /> Đăng xuất
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/login" onClick={closeMenu}>
                    Đăng nhập
                  </Link>
                </Button>
                <Button size="sm" className="w-full" asChild>
                  <Link to="/register" onClick={closeMenu}>
                    Đăng ký
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
