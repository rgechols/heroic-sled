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

  function truncateHTML(html, max) {
    var div = document.createElement('div');
    div.innerHTML = html;
    var text = div.textContent || div.innerText || '';
    if (text.length <= max) return text;
    return text.substring(0, max).replace(/\s+\S*$/, '') + '\u2026';
  }

  function renderItem(item) {
    var el = document.createElement('div');
    el.className = 'microfeed-item';

    var html = '';

    if (item.image) {
      html += '<img src="' + item.image + '" alt="" class="microfeed-thumb" loading="lazy">';
    }

    if (item.title) {
      var url = item.url || '#';
      html += '<p class="microfeed-title"><a href="' + url + '">' + item.title + '</a></p>';
    } else if (item.content_html) {
      html += '<p class="microfeed-text">' + truncateHTML(item.content_html, 180) + '</p>';
    }

    if (item.date_published) {
      html += '<span class="microfeed-time">' + relativeTime(item.date_published) + '</span>';
    }

    el.innerHTML = html;
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
