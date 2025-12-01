import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Hotel Reservation SignIn"
        description="This is SignIn page for Hotel Reservation system"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
