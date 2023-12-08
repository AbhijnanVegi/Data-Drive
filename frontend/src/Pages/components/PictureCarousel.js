// PictureCarousel.js
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import api from "../../utils/api";
import { useState, useEffect } from "react";
const indicatorStyles = {
    background: "#222222",
    width: 8,
    height: 8,
    display: "inline-block",
    margin: "0 8px",
};


/**
 * Renders a picture carousel component.
 * 
 * @param {Object} props - The component props.
 * @param {string[]} props.pictures - The array of picture names.
 * @returns {JSX.Element} The picture carousel component.
 */
export const PictureCarousel = ({ pictures }) => {
    const [imageBlobs, setImageBlobs] = useState([]);

    useEffect(() => {
        console.log("trying to fetch pictures")
        Promise.all(pictures.map(picture =>
            api.get(`/get/${picture}`, { responseType: 'blob' })
                .then(res => URL.createObjectURL(res.data))
                .catch(err => console.error(err))
        ))
            .then(blobURLs => {
                setImageBlobs(blobURLs);
            });
    }, [pictures]);

    return (
        <div id="carousel-div">
            <Carousel
                width="700px"
                height="500px"
                infiniteLoop={true}
                renderIndicator={(onClickHandler, isSelected, index, label) => {
                    if (isSelected) {
                        return (
                            <li
                                style={{ ...indicatorStyles, background: "#5f676a" }}
                                aria-label={`Selected: ${label} ${index + 1}`}
                                title={`Selected: ${label} ${index + 1}`}
                            />
                        );
                    }
                    return (
                        <li
                            style={indicatorStyles}
                            onClick={onClickHandler}
                            onKeyDown={onClickHandler}
                            value={index}
                            key={index}
                            role="button"
                            tabIndex={0}
                            title={`${label} ${index + 1}`}
                            aria-label={`${label} ${index + 1}`}
                        />
                    );
                }}
            >
                {
                    imageBlobs.map((blob, index) => (
                        <div key={index}>
                            <img src={blob} alt={pictures[index]} />
                        </div>
                    ))
                }
            </Carousel>
        </div>
    )
}