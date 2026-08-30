"""
Transmission Line Parameter Calculator - Matplotlib Visualizer
EE 315 • Power Systems Course Project • Group 4

This script plots:
1. Conductor Cross Section & Stranding Architecture (Single strand, 2/3/4-bundle, 6/1 ACSR)
2. Transmission Circuit & Tower Geometry Layout (Single Phase, 3-Phase Single Circuit, 3-Phase Double Circuit)
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches


def plot_conductor_cross_section(strand_type='multiple', bundle_type='2-bundle', r=0.012, d=0.4, filename='conductor_cross_section.png'):
    """
    Plots the conductor cross-section with dimension markings.
    """
    fig, ax = plt.subplots(figsize=(6, 5), dpi=300)
    fig.patch.set_facecolor('#fbf9f5')
    ax.set_facecolor('#ffffff')
    
    # Calculate GMR values
    r_prime = 0.7788 * r
    if strand_type == 'single':
        gmrl = r_prime
        gmrc = r
        title = f"Conductor Cross Section: Single Solid Strand\n$r = {r*1000:.1f}\\text{{ mm}},\\ GMR_L = {gmrl*1000:.2f}\\text{{ mm}}$"
        
        # Single conductor at center
        circle = patches.Circle((0, 0), r, facecolor='#3b82f6', edgecolor='#1d4ed8', linewidth=2, alpha=0.85, label='Al Conductor')
        ax.add_patch(circle)
        
        # Center marker
        ax.plot(0, 0, 'k+', markersize=8)
        
        # Radius dimension line
        ax.annotate('', xy=(r, 0), xytext=(0, 0),
                    arrowprops=dict(arrowstyle='<->', color='#c2410c', lw=1.8))
        ax.text(r / 2, r * 0.2, f"$r = {r*1000:.1f}\\text{{ mm}}$", color='#c2410c',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
        
        limit = r * 2.2
        ax.set_xlim(-limit, limit)
        ax.set_ylim(-limit, limit)
        
    elif bundle_type == 'acsr':
        # 6/1 ACSR (7-strand)
        gmrl = 2.177 * r
        gmrc = 2.177 * r
        title = f"Conductor Cross Section: 6/1 ACSR (7-Strand)\n$r = {r*1000:.1f}\\text{{ mm}},\\ GMR = {gmrl*1000:.2f}\\text{{ mm}}$"
        
        # Central steel strand
        steel_core = patches.Circle((0, 0), r, facecolor='#475569', edgecolor='#0f172a', linewidth=1.5, label='Steel Core (Central)')
        ax.add_patch(steel_core)
        ax.plot(0, 0, 'w+', markersize=6)
        
        # 6 outer aluminum strands touching center
        R_ring = 2 * r
        for i in range(6):
            angle = i * (2 * np.pi / 6)
            cx = R_ring * np.cos(angle)
            cy = R_ring * np.sin(angle)
            al_strand = patches.Circle((cx, cy), r, facecolor='#93c5fd', edgecolor='#2563eb', linewidth=1.5,
                                       label='Al Strand (Outer)' if i == 0 else None)
            ax.add_patch(al_strand)
            ax.plot(cx, cy, 'k+', markersize=4)
            
        # Dimension for strand radius
        ax.annotate('', xy=(0, r), xytext=(0, 0),
                    arrowprops=dict(arrowstyle='<->', color='#c2410c', lw=1.8))
        ax.text(0.15 * r, 0.5 * r, f"$r = {r*1000:.1f}\\text{{ mm}}$", color='#c2410c',
                ha='left', va='center', fontsize=10, fontweight='bold')
        
        limit = 3.5 * r
        ax.set_xlim(-limit, limit)
        ax.set_ylim(-limit, limit)
        
    else:
        # Bundled conductor
        if bundle_type == '2-bundle':
            gmrl = np.sqrt(r_prime * d)
            gmrc = np.sqrt(r * d)
            title = f"Conductor Cross Section: 2-Bundle\n$d = {d:.2f}\\text{{ m}},\\ r = {r*1000:.1f}\\text{{ mm}},\\ GMR_L = {gmrl*1000:.2f}\\text{{ mm}}$"
            
            coords = [(-d/2, 0), (d/2, 0)]
            
            # Dashed connecting line
            ax.plot([-d/2, d/2], [0, 0], 'k--', lw=1.2, alpha=0.6)
            
            # Dimension arrow
            ax.annotate('', xy=(d/2, -d*0.25), xytext=(-d/2, -d*0.25),
                        arrowprops=dict(arrowstyle='<->', color='#c2410c', lw=1.8))
            ax.text(0, -d*0.35, f"$d = {d:.2f}\\text{{ m}}$", color='#c2410c',
                    ha='center', va='top', fontsize=11, fontweight='bold')
            
        elif bundle_type == '3-bundle':
            gmrl = (r_prime * (d**2)) ** (1/3)
            gmrc = (r * (d**2)) ** (1/3)
            title = f"Conductor Cross Section: 3-Bundle (Equilateral $\\Delta$)\n$d = {d:.2f}\\text{{ m}},\\ GMR_L = {gmrl*1000:.2f}\\text{{ mm}}$"
            
            h = d * np.sqrt(3) / 2
            coords = [(-d/2, -h/3), (d/2, -h/3), (0, 2*h/3)]
            
            # Equilateral triangle outline
            tri = np.array(coords + [coords[0]])
            ax.plot(tri[:, 0], tri[:, 1], 'k--', lw=1.2, alpha=0.6)
            
            # Bottom spacing dimension
            ax.annotate('', xy=(d/2, -h/3 - d*0.18), xytext=(-d/2, -h/3 - d*0.18),
                        arrowprops=dict(arrowstyle='<->', color='#c2410c', lw=1.8))
            ax.text(0, -h/3 - d*0.26, f"$d = {d:.2f}\\text{{ m}}$", color='#c2410c',
                    ha='center', va='top', fontsize=11, fontweight='bold')
            
        elif bundle_type == '4-bundle':
            gmrl = 1.09 * (r_prime * (d**3)) ** (1/4)
            gmrc = 1.09 * (r * (d**3)) ** (1/4)
            title = f"Conductor Cross Section: 4-Bundle (Square)\n$d = {d:.2f}\\text{{ m}},\\ GMR_L = {gmrl*1000:.2f}\\text{{ mm}}$"
            
            s = d / 2
            coords = [(-s, -s), (s, -s), (s, s), (-s, s)]
            
            # Square outline
            sq = np.array(coords + [coords[0]])
            ax.plot(sq[:, 0], sq[:, 1], 'k--', lw=1.2, alpha=0.6)
            
            # Dimension
            ax.annotate('', xy=(s, -s - d*0.18), xytext=(-s, -s - d*0.18),
                        arrowprops=dict(arrowstyle='<->', color='#c2410c', lw=1.8))
            ax.text(0, -s - d*0.26, f"$d = {d:.2f}\\text{{ m}}$", color='#c2410c',
                    ha='center', va='top', fontsize=11, fontweight='bold')
        
        # Draw subconductors
        vis_r = max(r, d * 0.08)
        for idx, (cx, cy) in enumerate(coords):
            subc = patches.Circle((cx, cy), vis_r, facecolor='#3b82f6', edgecolor='#1d4ed8', linewidth=1.5,
                                  label='Subconductor' if idx == 0 else None)
            ax.add_patch(subc)
            ax.plot(cx, cy, 'k+', markersize=5)
            
        limit = d * 0.85 if d > 0 else 1.0
        ax.set_xlim(-limit, limit)
        ax.set_ylim(-limit, limit)

    ax.set_aspect('equal')
    ax.set_title(title, fontsize=12, pad=12, fontweight='bold', color='#1c1917')
    ax.legend(loc='upper right', framealpha=0.9, fontsize=9)
    ax.grid(True, linestyle=':', alpha=0.5, color='#a8a29e')
    ax.set_xlabel('Cross-section $X$ [m]', fontsize=10)
    ax.set_ylabel('Cross-section $Y$ [m]', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(filename, bbox_inches='tight')
    print(f"Saved conductor cross-section plot to {filename}")
    plt.close()


def plot_circuit_layout(system_type='three-phase', circuit_type='single-circuit',
                        D=1.0, D12=10.0, D23=10.0, D31=20.0,
                        d1=4.0, d2=5.0, d3=4.0, d4=6.0,
                        filename='circuit_layout.png'):
    """
    Plots the transmission circuit geometry / tower conductor spatial layout.
    """
    fig, ax = plt.subplots(figsize=(6.5, 5), dpi=300)
    fig.patch.set_facecolor('#fbf9f5')
    ax.set_facecolor('#ffffff')
    
    if system_type == 'single-phase':
        title = f"Transmission Circuit Layout: Single-Phase Line\n$D = {D:.2f}\\text{{ m}}$"
        pos = {'Phase A': (-D/2, 0), 'Phase B': (D/2, 0)}
        colors = {'Phase A': '#2563eb', 'Phase B': '#ea580c'}
        
        for name, (px, py) in pos.items():
            circle = patches.Circle((px, py), D*0.06, facecolor=colors[name], edgecolor='#0f172a', lw=1.5, zorder=4)
            ax.add_patch(circle)
            ax.text(px, py, name.split()[1], color='white', fontweight='bold', ha='center', va='center', fontsize=11, zorder=5)
            ax.text(px, py + D*0.12, name, color='#1c1917', fontweight='600', ha='center', fontsize=10)
            
        # Dimension line
        ax.annotate('', xy=(D/2, -D*0.15), xytext=(-D/2, -D*0.15),
                    arrowprops=dict(arrowstyle='<->', color='#16a34a', lw=2))
        ax.text(0, -D*0.25, f"$D = {D:.2f}\\text{{ m}}$", color='#16a34a',
                ha='center', va='top', fontsize=11, fontweight='bold')
        
        ax.plot([-D/2, D/2], [0, 0], 'k:', alpha=0.4)
        
        lim = D * 0.85
        ax.set_xlim(-lim, lim)
        ax.set_ylim(-lim * 0.6, lim * 0.6)
        
    elif system_type == 'three-phase' and circuit_type == 'single-circuit':
        gmd = (D12 * D23 * D31) ** (1/3)
        title = f"Three-Phase Single Circuit Layout\n$D_{{12}}={D12}m,\\ D_{{23}}={D23}m,\\ D_{{31}}={D31}m\\ (GMD={gmd:.2f}m)$"
        
        if np.isclose(D12 + D23, D31, atol=1e-3):
            pos = {'Phase A': (-D12, 0), 'Phase B': (0, 0), 'Phase C': (D23, 0)}
        else:
            x1 = (D12**2 - D31**2 + D23**2) / (2 * D23) if D23 > 0 else 0
            y1_sq = D12**2 - x1**2
            y1 = np.sqrt(max(0, y1_sq))
            cx = (x1 + 0 + D23) / 3
            cy = (y1 + 0 + 0) / 3
            pos = {'Phase A': (x1 - cx, y1 - cy), 'Phase B': (0 - cx, 0 - cy), 'Phase C': (D23 - cx, 0 - cy)}
            
        colors = {'Phase A': '#dc2626', 'Phase B': '#d97706', 'Phase C': '#2563eb'}
        scale = max(D12, D23, D31, 1.0)
        
        pA, pB, pC = pos['Phase A'], pos['Phase B'], pos['Phase C']
        ax.plot([pA[0], pB[0]], [pA[1], pB[1]], 'g--', lw=1.2, alpha=0.7)
        ax.plot([pB[0], pC[0]], [pB[1], pC[1]], 'g--', lw=1.2, alpha=0.7)
        ax.plot([pC[0], pA[0]], [pC[1], pA[1]], 'g--', lw=1.2, alpha=0.7)
        
        ax.text((pA[0]+pB[0])/2 - scale*0.05, (pA[1]+pB[1])/2, f"$D_{{12}}={D12}m$", color='#16a34a', fontsize=9, fontweight='bold')
        ax.text((pB[0]+pC[0])/2, (pB[1]+pC[1])/2 - scale*0.08, f"$D_{{23}}={D23}m$", color='#16a34a', fontsize=9, fontweight='bold', ha='center')
        ax.text((pC[0]+pA[0])/2 + scale*0.05, (pC[1]+pA[1])/2, f"$D_{{31}}={D31}m$", color='#16a34a', fontsize=9, fontweight='bold')
        
        for name, (px, py) in pos.items():
            circle = patches.Circle((px, py), scale*0.04, facecolor=colors[name], edgecolor='#0f172a', lw=1.5, zorder=4)
            ax.add_patch(circle)
            letter = name.split()[1]
            ax.text(px, py, letter, color='white', fontweight='bold', ha='center', va='center', fontsize=11, zorder=5)
            
        lim = scale * 0.75
        ax.set_xlim(-lim, lim)
        ax.set_ylim(-lim * 0.75, lim * 0.75)
        
    elif system_type == 'three-phase' and circuit_type == 'double-circuit':
        title = f"Three-Phase Double Circuit Tower Layout\n$d_1={d1}m,\\ d_2={d2}m,\\ d_3={d3}m,\\ d_4={d4}m$"
        
        y_top, y_mid, y_bot = d4, 0, -d4
        
        pos_left = {'a': (-d1/2, y_top), 'b': (-d2/2, y_mid), 'c': (-d3/2, y_bot)}
        pos_right = {"a'": (d1/2, y_top), "b'": (d2/2, y_mid), "c'": (d3/2, y_bot)}
        
        ax.axvline(0, color='#64748b', linestyle='-.', lw=1.5, label='Tower Centerline')
        
        ax.plot([-d1/2, d1/2], [y_top, y_top], color='#94a3b8', lw=2, linestyle='--')
        ax.plot([-d2/2, d2/2], [y_mid, y_mid], color='#94a3b8', lw=2, linestyle='--')
        ax.plot([-d3/2, d3/2], [y_bot, y_bot], color='#94a3b8', lw=2, linestyle='--')
        
        ax.text(0, y_top + d4*0.12, f"$d_1 = {d1}m$", color='#16a34a', ha='center', fontweight='bold', fontsize=9)
        ax.text(0, y_mid + d4*0.12, f"$d_2 = {d2}m$", color='#16a34a', ha='center', fontweight='bold', fontsize=9)
        ax.text(0, y_bot + d4*0.12, f"$d_3 = {d3}m$", color='#16a34a', ha='center', fontweight='bold', fontsize=9)
        
        scale = max(d1, d2, d3, d4 * 2)
        node_r = scale * 0.035
        
        for name, (px, py) in pos_left.items():
            circle = patches.Circle((px, py), node_r, facecolor='#2563eb', edgecolor='#0f172a', lw=1.5, zorder=4)
            ax.add_patch(circle)
            ax.text(px, py, name, color='white', fontweight='bold', ha='center', va='center', fontsize=10, zorder=5)
            
        for name, (px, py) in pos_right.items():
            circle = patches.Circle((px, py), node_r, facecolor='#ea580c', edgecolor='#0f172a', lw=1.5, zorder=4)
            ax.add_patch(circle)
            ax.text(px, py, name, color='white', fontweight='bold', ha='center', va='center', fontsize=10, zorder=5)
            
        lim_x = max(d1, d2, d3) * 0.8
        lim_y = d4 * 1.6
        ax.set_xlim(-lim_x, lim_x)
        ax.set_ylim(-lim_y, lim_y)

    ax.set_aspect('equal')
    ax.set_title(title, fontsize=12, pad=12, fontweight='bold', color='#1c1917')
    ax.grid(True, linestyle=':', alpha=0.5, color='#a8a29e')
    ax.set_xlabel('Horizontal Coordinates $X$ [m]', fontsize=10)
    ax.set_ylabel('Vertical Coordinates $Y$ [m]', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(filename, bbox_inches='tight')
    print(f"Saved circuit layout plot to {filename}")
    plt.close()


if __name__ == '__main__':
    print("Generating Transmission Line benchmark plots...")
    # 1. 2-Bundle Conductor Cross Section
    plot_conductor_cross_section(strand_type='multiple', bundle_type='2-bundle', r=0.012, d=0.4, filename='plot1_bundle_cross_section.png')
    
    # 2. 6/1 ACSR Conductor Cross Section
    plot_conductor_cross_section(strand_type='multiple', bundle_type='acsr', r=0.0168, filename='plot1_acsr_cross_section.png')
    
    # 3. 3-Phase Flat Single Circuit Layout
    plot_circuit_layout(system_type='three-phase', circuit_type='single-circuit', D12=10, D23=10, D31=20, filename='plot2_3phase_layout.png')
    
    # 4. 3-Phase Double Circuit Layout
    plot_circuit_layout(system_type='three-phase', circuit_type='double-circuit', d1=4, d2=5, d3=4, d4=6, filename='plot2_double_circuit_layout.png')
    print("All plots generated successfully!")
