import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";

const schema = z.object({
  username: z.string().min(1, "Username không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Redirect về trang trước nếu có, không thì về trang chủ
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      login(res.data.token, res.data.user);
      toast.success(`Chào mừng, ${res.data.user.username}!`);
      navigate(from, { replace: true });
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message ?? "Đăng nhập thất bại");
    },
  });

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-2 pb-4">
          <BookOpen className="mx-auto text-primary" size={36} />
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <p className="text-sm text-muted-foreground">Chào mừng bạn trở lại</p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Nhập username"
                autoComplete="username"
                autoFocus
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                // Security: current-password giúp password manager hoạt động đúng
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
