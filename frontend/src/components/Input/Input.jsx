/* eslint-disable react/prop-types */
import { Input } from 'antd';
import s from './Input.module.css';
function MyInput({ value, onChange, placeholder }) {
  return (
    <Input
      className={s.search}
      aria-label="Поиск фильма"
      prefix={
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="10.5"
            cy="10.5"
            r="6.5"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      }
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      allowClear
    />
  );
}
export default MyInput;
