# 团队成员

我们是一群志同道合的摘星者，为了改变这个世界而努力奋斗。

<div class="team-grid">

<div class="team-member">
  <img src="/images/须弥Sumeru.jpg" class="avatar" alt="须弥Sumeru">
  <div class="info">
    <div class="name">须弥Sumeru</div>
    <div class="role">创始人 / 开发兼运维</div>
    <a href="https://github.com/SurnameQ114514" target="_blank" class="github-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.118-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
      GitHub
    </a>
    <a href="https://space.bilibili.com/1378756216" target="_blank" class="github-link">
      <img src="/images/Bilibili_tv_a.svg" width="16" height="16" alt="Bilibili" class="bilibili-icon"/>
      Bilibili
    </a>
  </div>
</div>

<div class="team-member">
  <img src="/images/流萤青提小蛋糕.jpg" class="avatar" alt="流萤青提小蛋糕">
  <div class="info">
    <div class="name">流萤青提小蛋糕</div>
    <div class="role">策划</div>
    <a href="https://space.bilibili.com/1162523527" target="_blank" class="github-link">
      <img src="/images/Bilibili_tv_a.svg" width="16" height="16" alt="Bilibili" class="bilibili-icon"/>
      Bilibili
    </a>
  </div>
</div>

<div class="team-member">
  <img src="/images/时空星文.jpg" class="avatar" alt="时空星文">
  <div class="info">
    <div class="name">时空星文</div>
    <div class="role">策划</div>
    <a href="https://space.bilibili.com/304248595" target="_blank" class="github-link">
      <img src="/images/Bilibili_tv_a.svg" width="16" height="16" alt="Bilibili" class="bilibili-icon"/>
      Bilibili
    </a>
  </div>
</div>

<div class="team-member">
  <img src="/images/我是万里驴.jpg" class="avatar" alt="我是万里驴">
  <div class="info">
    <div class="name">我是万里驴</div>
    <div class="role">宣发</div>
    <a href="https://space.bilibili.com/3546798830389810" target="_blank" class="github-link">
      <img src="/images/Bilibili_tv_a.svg" width="16" height="16" alt="Bilibili" class="bilibili-icon"/>
      Bilibili
    </a>
  </div>
</div>

<div class="team-member">
  <img src="/images/Yoko-cx.jpg" class="avatar" alt="Yoko-cx">
  <div class="info">
    <div class="name">Yoko-cx</div>
    <div class="role">音乐 / 美术</div>
    <a href="https://space.bilibili.com/3494366364568066" target="_blank" class="github-link">
      <img src="/images/Bilibili_tv_a.svg" width="16" height="16" alt="Bilibili" class="bilibili-icon"/>
      Bilibili
    </a>
  </div>
</div>

<div class="team-member">
  <img src="/images/罗辑.jpeg" class="avatar" alt="罗辑">
  <div class="info">
    <div class="name">罗辑</div>
    <div class="role">文案</div>
    <a href="https://space.bilibili.com/448846103" target="_blank" class="github-link">
      <img src="/images/Bilibili_tv_a.svg" width="16" height="16" alt="Bilibili" class="bilibili-icon"/>
      Bilibili
    </a>
  </div>
</div>

<div class="team-member">
  <img src="/images/Rational.jpg" class="avatar" alt="Rational.☁">
  <div class="info">
    <div class="name">Rational.☁</div>
    <div class="role">画师</div>
  </div>
</div>

</div>

<style>
.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .team-grid {
    grid-template-columns: 1fr;
  }
}

.team-member {
  background: rgba(128, 128, 128, 0.05);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.team-member:hover {
  background: rgba(128, 128, 128, 0.1);
  transform: translateY(-4px);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.info {
  flex: 1;
}

.name {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 4px;
}

.role {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: opacity 0.2s;
  margin-right: 12px;
}

.github-link:last-child {
  margin-right: 0;
}

.github-link:hover {
  opacity: 0.8;
}

.bilibili-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
