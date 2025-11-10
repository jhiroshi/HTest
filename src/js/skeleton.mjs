// [SKELETON]
function skeletonItem() {
  const wrapper = document.createElement("div");
  wrapper.className = "item";
  const skAvatar = document.createElement("div");
  skAvatar.className = "skeleton sk-avatar";
  const skContent = document.createElement("div");
  skContent.className = "content";
  const skTitle = document.createElement("div");
  skTitle.className = "skeleton sk-title";
  const skSub = document.createElement("div");
  skSub.className = "skeleton sk-sub";
  skContent.append(skTitle, skSub);
  wrapper.append(skAvatar, skContent);
  return wrapper;
}
function showSkeleton(count = 5) {
  const list = document.getElementById("tbody-items");
  list.innerHTML = "Loading Data...";
  for (let i = 0; i < count; i++) list.appendChild(skeletonItem());
}
function hideSkeleton() {
  const card = document.getElementById("tbody-items").closest(".card");
  if (card) card.setAttribute("aria-busy", "false");
}

export { showSkeleton, hideSkeleton };