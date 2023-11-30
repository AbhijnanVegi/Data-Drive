// PictureCarousel.js
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
const indicatorStyles = {
    background: "#222222",
    width: 8,
    height: 8,
    display: "inline-block",
    margin: "0 8px",
};


export const PictureCarousel = ({ pictures }) => (
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
            {pictures.map((picture) => {
                return (
                    <div key={picture}>
                        <img src={"http://localhost:8000/download/" + picture} />
                        <p className="legend">{picture}</p>
                    </div>
                );
            })}
        </Carousel>
    </div>
);