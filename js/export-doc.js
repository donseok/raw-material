// ===== Dashboard DOCX Export =====

const EXPORT_TABS = ['plan', 'alloc', 'order', 'supplier', 'import', 'inventory', 'stats'];
const EXPORT_WAIT_MS = 350;
const EXPORT_IMAGE_WIDTH = 650;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTabButton(tabKey) {
  return document.querySelector('.tab-btn[data-tab="' + tabKey + '"]');
}

function getTabContent(tabKey) {
  return document.getElementById('tab-' + tabKey);
}

function getTabTitle(tabKey) {
  const button = getTabButton(tabKey);
  return button ? button.textContent.trim() : tabKey;
}

function setActiveTab(tabKey) {
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tabKey);
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === 'tab-' + tabKey);
  });
}

async function activateTabForExport(tabKey) {
  setActiveTab(tabKey);
  renderCharts(tabKey);
  await wait(EXPORT_WAIT_MS);
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function getExportBlocks(tabContent) {
  return Array.from(tabContent.children).filter(element => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.classList.contains('toolbar')) return false;
    return element.offsetHeight > 0 && element.offsetWidth > 0;
  });
}

function getBlockTitle(block, index) {
  if (block.classList.contains('kpi-row')) return '주요 KPI';

  if (block.classList.contains('grid-2') || block.classList.contains('grid-3')) {
    const titles = Array.from(block.querySelectorAll('.card-title'))
      .map(node => cleanText(node.textContent))
      .filter(Boolean);

    return titles.length > 0 ? titles.join(' / ') : '요약 섹션 ' + index;
  }

  const titleNode = block.querySelector('.card-title');
  const title = titleNode ? cleanText(titleNode.textContent) : '';
  return title || '세부 섹션 ' + index;
}

async function captureElementSnapshot(element) {
  const canvas = await html2canvas(element, {
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f0f2f5',
    scale: Math.min(window.devicePixelRatio || 1, 2),
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: Math.max(document.documentElement.clientWidth, element.scrollWidth),
    windowHeight: Math.max(document.documentElement.clientHeight, element.scrollHeight)
  });

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1));
  if (!blob) throw new Error('스냅샷 생성에 실패했습니다.');

  return {
    data: await blob.arrayBuffer(),
    width: canvas.width,
    height: canvas.height
  };
}

function buildImageSize(snapshot) {
  const width = EXPORT_IMAGE_WIDTH;
  const height = Math.max(1, Math.round(width * (snapshot.height / snapshot.width)));
  return { width, height };
}

async function collectDashboardSnapshots() {
  const sections = [];

  for (const tabKey of EXPORT_TABS) {
    await activateTabForExport(tabKey);

    const tabContent = getTabContent(tabKey);
    const blocks = getExportBlocks(tabContent);
    const snapshots = [];

    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      const title = getBlockTitle(block, index + 1);
      const snapshot = await captureElementSnapshot(block);
      snapshots.push({ title, snapshot });
    }

    sections.push({
      title: getTabTitle(tabKey),
      snapshots
    });
  }

  return sections;
}

async function createDashboardDoc(sections) {
  const {
    AlignmentType,
    Document,
    HeadingLevel,
    ImageRun,
    Packer,
    PageOrientation,
    Paragraph,
    TextRun
  } = window.docx;

  const loggedInUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('loggedInUser'));
    } catch (error) {
      return null;
    }
  })();

  const createdAt = new Date();
  const createdAtText = createdAt.toLocaleString('ko-KR');
  const docChildren = [
    new Paragraph({
      text: '철스크랩 대시보드 스냅샷 보고서',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun('생성 일시: ' + createdAtText),
        new TextRun({ text: ' | 작성 기준 사용자: ' + (loggedInUser?.name || '미확인'), break: 1 })
      ],
      spacing: { after: 320 }
    })
  ];

  sections.forEach((section, sectionIndex) => {
    docChildren.push(new Paragraph({
      text: section.title,
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: sectionIndex > 0,
      spacing: { after: 200 }
    }));

    section.snapshots.forEach((item, snapshotIndex) => {
      const size = buildImageSize(item.snapshot);

      docChildren.push(new Paragraph({
        text: item.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: snapshotIndex === 0 ? 0 : 200, after: 120 }
      }));

      docChildren.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: item.snapshot.data,
            transformation: size
          })
        ],
        spacing: { after: 200 }
      }));
    });
  });

  const documentInstance = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
          size: { orientation: PageOrientation.LANDSCAPE }
        }
      },
      children: docChildren
    }]
  });

  return Packer.toBlob(documentInstance);
}

async function exportDashboardDoc() {
  if (!window.html2canvas || !window.saveAs || !window.docx) {
    showToast('문서 저장 라이브러리를 불러오지 못했습니다.', 'error');
    return;
  }

  const exportButton = document.getElementById('exportDocBtn');
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || EXPORT_TABS[0];
  const originalScrollY = window.scrollY;
  const originalAnimation = window.Chart?.defaults?.animation;

  try {
    exportButton.disabled = true;
    exportButton.textContent = 'DOC 저장 중...';
    document.body.style.cursor = 'progress';
    showToast('대시보드 DOC 문서를 생성하고 있습니다.', 'info');

    if (window.Chart && window.Chart.defaults) {
      window.Chart.defaults.animation = false;
    }

    window.scrollTo(0, 0);

    const sections = await collectDashboardSnapshots();
    const blob = await createDashboardDoc(sections);
    const today = new Date().toISOString().slice(0, 10);

    saveAs(blob, 'steel-scrap-dashboard-' + today + '.docx');
    showToast('DOCX 파일이 저장되었습니다.', 'success');
  } catch (error) {
    console.error(error);
    showToast('DOCX 저장 중 오류가 발생했습니다.', 'error');
  } finally {
    if (window.Chart && window.Chart.defaults) {
      window.Chart.defaults.animation = originalAnimation;
    }

    await activateTabForExport(activeTab);
    window.scrollTo(0, originalScrollY);
    document.body.style.cursor = '';
    exportButton.disabled = false;
    exportButton.textContent = 'DOC 저장';
  }
}
