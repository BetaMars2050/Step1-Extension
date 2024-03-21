import { ElMessage } from "element-plus";

export const showMessage = ({ type = "success", message }) => {
  ElMessage({
    message,
    type,
    offset: 8,
  });
};
