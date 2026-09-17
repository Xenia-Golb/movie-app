/* eslint-disable react/prop-types */
import { useState } from 'react';
import s from './Card.module.css';
function Card({ title, movieId, date, description, image, genre, rating }) {
  const [failedImage, setFailedImage] = useState(null);
  return (
    <article className={s.card}>
      <a
        href={`#movie/${movieId}`}
        className={s.poster}
        aria-label={`Подробнее: ${title}`}
      >
        {image && failedImage !== image ? (
          <img
            src={image}
            alt={`Постер: ${title}`}
            loading="lazy"
            onError={() => setFailedImage(image)}
          />
        ) : (
          <div className={s.fallback}>
            <span aria-hidden="true">▷</span>
            <p>{title}</p>
          </div>
        )}
        <div className={s.rating}>
          ★ <span>{rating}</span>
        </div>
        <div className={s.synopsis}>
          <p>{description || 'Описание пока не добавлено.'}</p>
        </div>
      </a>
      <div className={s.info}>
        <h3 title={title}>
          <a href={`#movie/${movieId}`}>{title}</a>
        </h3>
        <p className={s.meta}>
          {date || 'Дата неизвестна'}
          {genre && (
            <>
              <span>·</span>
              {genre}
            </>
          )}
        </p>
      </div>
    </article>
  );
}
export default Card;
