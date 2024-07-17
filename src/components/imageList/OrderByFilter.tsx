import { ChangeEventHandler } from "react";
import Select from "../Select";

const OrderByFilter = ({
  onChange,
  value,
}: {
  onChange: ChangeEventHandler<HTMLSelectElement>;
  value: string;
}) => {
  return (
    <Select onChange={onChange} value={value}>
      <option value="createdAt">최신순</option>
      <option value="popularity">인기순</option>
    </Select>
  );
};

export default OrderByFilter;
