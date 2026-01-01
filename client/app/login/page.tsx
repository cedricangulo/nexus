import { LoginForm } from "@/components/auth/login-form";
import PixelBlast from "@/components/pixel";
// import Beams from "@/components/pixel";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="absolute top-0 left-0 h-full w-full">
        <PixelBlast
          color="#0471fe"
          edgeFade={0.25}
          enableRipples
          patternDensity={1.2}
          patternScale={3}
          pixelSize={4}
          pixelSizeJitter={0.5}
          rippleIntensityScale={1}
          rippleSpeed={0.4}
          rippleThickness={0.12}
          speed={0.6}
          transparent
          variant="triangle"
        />
      </div>
      <div className="z-20 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
