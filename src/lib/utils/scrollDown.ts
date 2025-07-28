// Define a function to scrolldown (used after every new message)
export default function scrollDown() {
  window.scrollBy({
    top: document.body.scrollHeight,
    behavior: "smooth",
  })
}
