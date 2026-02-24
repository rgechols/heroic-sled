(function () {
  var container = document.getElementById('microfeed');
  if (!container) return;

  var feedURL = container.getAttribute('data-feed-url');
  if (!feedURL) return;

  function relativeTime(dateStr) {
    var now = Date.now();
    var then = new Date(dateStr).getTime();
    var diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
    return new Date(dateStr).toLocaleDateString();
  }

  function truncateText(html, max) {
    var div = document.createElement('div');
    div.innerHTML = html;
    var text = div.textContent || div.innerText || '';
    if (text.length <= max) return text;
    return text.substring(0, max).replace(/\s+\S*$/, '') + '\u2026';
  }

  function isSafeURL(url) {
    return typeof url === 'string' && /^https?:\/\//i.test(url);
  }

  function renderItem(item) {
    var el = document.createElement('div');
    el.className = 'microfeed-item';

    if (item.image && isSafeURL(item.image)) {
      var img = document.createElement('img');
      img.src = item.image;
      img.alt = '';
      img.className = 'microfeed-thumb';
      img.loading = 'lazy';
      el.appendChild(img);
    }

    if (item.title) {
      var p = document.createElement('p');
      p.className = 'microfeed-title';
      var a = document.createElement('a');
      a.href = isSafeURL(item.url) ? item.url : '#';
      a.textContent = item.title;
      p.appendChild(a);
      el.appendChild(p);
    } else if (item.content_html) {
      var p = document.createElement('p');
      p.className = 'microfeed-text';
      p.textContent = truncateText(item.content_html, 180);
      el.appendChild(p);
    }

    if (item.date_published) {
      var span = document.createElement('span');
      span.className = 'microfeed-time';
      span.textContent = relativeTime(item.date_published);
      el.appendChild(span);
    }

    return el;
  }

  fetch(feedURL)
    .then(function (res) { return res.json(); })
    .then(function (feed) {
      container.innerHTML = '';
      var items = (feed.items || []).slice(0, 5);
      if (items.length === 0) {
        container.innerHTML = '<p class="microfeed-empty">No recent posts.</p>';
        return;
      }
      items.forEach(function (item) {
        container.appendChild(renderItem(item));
      });
    })
    .catch(function () {
      container.innerHTML = '<p class="microfeed-error">Could not load micro.blog feed.</p>';
    });
})();
