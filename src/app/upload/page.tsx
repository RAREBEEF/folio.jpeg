import PageHeader from "@/components/PageHeader";
import UploadForm from "@/components/form/UploadForm";

const UploadPage = () => {
  return (
    <main>
      <PageHeader header="이미지 업로드" />
      <UploadForm />
    </main>
  );
};

export default UploadPage;
