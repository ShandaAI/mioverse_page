Shanda AI Research Tokyo made its official debut at SIGGRAPH Asia 2025 in Hong Kong, showcasing our latest breakthroughs in digital humans and world models to the global computer graphics community.

The centerpiece of our presentation was **Mio** (Multimodal Interactive Omni-Avatar), an end-to-end framework that addresses a fundamental problem in the field: current digital humans may look impressive, but they lack a "soul." Despite advances in visual fidelity, most digital humans still suffer from persona drift in extended conversations, unnatural "zombie-face" expressions, and an inability to learn or adapt from interactions.

Mio tackles these challenges through five cascading modules. The **Thinker** uses diegetic knowledge graphs to maintain temporal and personality consistency, exceeding GPT-4o in personality fidelity and achieving over 90% spoiler prevention in narrative scenarios. The **Talker** generates contextually matched natural speech. The **Facial Animator** produces dynamic microexpressions and natural listening responses, with over 90% user preference over competing approaches. The **Body Animator** implements streaming diffusion for fluid real-time motion at an FID of 0.057, matching offline model quality. Finally, the **Renderer** ensures high-fidelity, consistent visual embodiment across interactions.

In our evaluations, Mio achieved an Interactive Intelligence Score of 76.0, surpassing previous benchmarks by 8.4 points across cognitive resonance, facial synchronization, and body fluidity.

Beyond the main presentation, our team organized a Birds-of-a-Feather session titled **"The Evolution of Games in the AI Era"**, exploring how generative AI and large-scale world models are transforming game computer graphics. Distinguished researchers from the University of Tokyo, Institute of Science Tokyo, and Shanghai AI Lab joined us to discuss personality-aligned NPC generation, multi-view consistent stylized rendering, and self-evolving game systems.

We also hosted the **Shanda Tokyo Night** dinner event, bringing together researchers, industry leaders, and collaborators for an evening of discussion about the future of interactive intelligence. Leading scholars from the University of Hong Kong, CUHK, HKUST, and Tokyo Science University endorsed interactive intelligence as the critical next frontier for digital human research.

Our technical report, pretrained models, and evaluation benchmarks are publicly available at the [Mio project page](https://shandaai.github.io/project_mio_page/).
