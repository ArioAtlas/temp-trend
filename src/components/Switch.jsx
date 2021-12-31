function Switch({ description }) {
    return (
        <div class="switch">
            <input class="hide" id="toggle" type="checkbox" />
            <label for="toggle">
                <span class="hide">Label Title</span>
            </label>
            <span className="title">{description}</span>
        </div>
    );
}

export default Switch;
