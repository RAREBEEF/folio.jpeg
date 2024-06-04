"use client";

import PageHeader from "@/components/PageHeader";
import ProfileForm from "@/components/form/ProfileForm";

const ProfilePage = () => {
  return (
    <main>
      <PageHeader header="프로필 설정" />
      <ProfileForm />
    </main>
  );
};

export default ProfilePage;
