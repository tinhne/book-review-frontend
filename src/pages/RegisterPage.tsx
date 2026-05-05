import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
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

const schema = z
  .object({
    username: z
      .string()
      .min(3, "Tối thiểu 3 ký tự")
      .max(50, "Tối đa 50 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Chỉ gồm chữ, số và dấu _"),
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Tối thiểu 8 ký tự")
      .max(100, "Tối đa 100 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

// Config field để tránh lặp JSX
const FIELDS = [
  {
    name: "username" as const,
    label: "Username",
    placeholder: "vd: bookworm_123",
    type: "text",
    autoComplete: "username",
  },
  {
    name: "email" as const,
    label: "Email",
    placeholder: "email@example.com",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "password" as const,
    label: "Mật khẩu",
    placeholder: "Ít nhất 8 ký tự",
    type: "password",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword" as const,
    label: "Xác nhận mật khẩu",
    placeholder: "Nhập lại mật khẩu",
    type: "password",
    autoComplete: "new-password",
  },
] as const;

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: ({ username, email, password }: FormData) =>
      authApi.register({ username, email, password }),
    onSuccess: (res) => {
      login(res.data.token, res.data.user);
      toast.success("Đăng ký thành công!");
      navigate("/");
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message ?? "Đăng ký thất bại");
    },
  });

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4 py-10">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-2 pb-4">
          <BookOpen className="mx-auto text-primary" size={36} />
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tham gia cộng đồng đọc sách
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4"
            noValidate
          >
            {FIELDS.map(({ name, label, placeholder, type, autoComplete }) => (
              <div key={name} className="space-y-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className={errors[name] ? "border-destructive" : ""}
                  {...register(name)}
                />
                {errors[name] && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Đang tạo tài khoản..." : "Đăng ký"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
