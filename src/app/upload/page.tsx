import PageHeader from "@/components/layouts/PageHeader";
import UploadForm from "@/components/upload/UploadForm";

const UploadPage = () => {
  return (
    <main>
      <PageHeader header="이미지 업로드" />
      <UploadForm />
    </main>
  );
};

export default UploadPage;
