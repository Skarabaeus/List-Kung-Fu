module TagsHelper

  def write_tag_colors
    css = StringIO.new
    TagsHelper::tag_colors.each_value do |color|
      css << color.to_css
    end

    css.string.html_safe
  end

  class TagColor
    attr_accessor :class_name, :color_name, :background_color, :foreground_color

    def initialize( args )
      @class_name = args[ :class_name ]
      @color_name = args[ :color_name ]
      @background_color = args[ :background_color ]
      @foreground_color = args[ :foreground_color ]
    end

    def to_css
      css = StringIO.new
      css << "\n.#{@class_name}{"
      css << "color:##{@foreground_color};"
      css << "background-color:##{@background_color};"
      css << "border: 1px solid ##{@background_color};}"

      css.string
    end

  end

  # http://www.colchis.com/clrtable.html
  def self.tag_colors
    color = {}
    color[ :c1 ] = TagColor.new( { :class_name => 'c1', :color_name => 'steelblue', :background_color => '4682B4', :foreground_color => '222222' } )
    color[ :c2 ] = TagColor.new( { :class_name => 'c2', :color_name => 'royalblue', :background_color => '4169E1', :foreground_color => 'eeeeee' } )
    color[ :c3 ] = TagColor.new( { :class_name => 'c3', :color_name => 'navy', :background_color => '000080', :foreground_color => 'eeeeee' } )
    color[ :c4 ] = TagColor.new( { :class_name => 'c4', :color_name => 'mediumblue', :background_color => '0000CD', :foreground_color => 'eeeeee' } )
    color[ :c5 ] = TagColor.new( { :class_name => 'c5', :color_name => 'dodgerblue', :background_color => '1E90FF', :foreground_color => '222222' } )
    color[ :c6 ] = TagColor.new( { :class_name => 'c6', :color_name => 'lightskyblue', :background_color => '87CEFA', :foreground_color => '222222' } )
    color[ :c7 ] = TagColor.new( { :class_name => 'c7', :color_name => 'mediumseagreen', :background_color => '3CB371', :foreground_color => '222222' } )
    color[ :c8 ] = TagColor.new( { :class_name => 'c8', :color_name => 'darkgreen', :background_color => '006400', :foreground_color => 'eeeeee' } )
    color[ :c9 ] = TagColor.new( { :class_name => 'c9', :color_name => 'limegreen', :background_color => '32CD32', :foreground_color => '222222' } )
    color[ :c10 ] = TagColor.new( { :class_name => 'c10', :color_name => 'lawngreen', :background_color => '7CFC00', :foreground_color => '222222' } )
    color[ :c11 ] = TagColor.new( { :class_name => 'c11', :color_name => 'lightgreen', :background_color => '90EE90', :foreground_color => '222222' } )
    color[ :c12 ] = TagColor.new( { :class_name => 'c12', :color_name => 'olivedrab', :background_color => '6B8E23', :foreground_color => '222222' } )
    color[ :c13 ] = TagColor.new( { :class_name => 'c13', :color_name => 'darkgoldenrod', :background_color => 'B8860B', :foreground_color => '222222' } )
    color[ :c14 ] = TagColor.new( { :class_name => 'c14', :color_name => 'gold', :background_color => 'FFD700', :foreground_color => '222222' } )
    color[ :c15 ] = TagColor.new( { :class_name => 'c15', :color_name => 'blanchedalmond', :background_color => 'FFEBCD', :foreground_color => '222222' } )
    color[ :c16 ] = TagColor.new( { :class_name => 'c16', :color_name => 'blurrywood', :background_color => 'DEB887', :foreground_color => '222222' } )
    color[ :c17 ] = TagColor.new( { :class_name => 'c17', :color_name => 'saddlebrown', :background_color => 'DEB887', :foreground_color => '222222' } )
    color[ :c18 ] = TagColor.new( { :class_name => 'c18', :color_name => 'maroon', :background_color => '800000', :foreground_color => 'eeeeee' } )
    color[ :c19 ] = TagColor.new( { :class_name => 'c19', :color_name => 'indianred', :background_color => 'CD5C5C', :foreground_color => 'eeeeee' } )
    color[ :c20 ] = TagColor.new( { :class_name => 'c20', :color_name => 'coral', :background_color => 'FF7F50', :foreground_color => '222222' } )
    color[ :c21 ] = TagColor.new( { :class_name => 'c21', :color_name => 'darkorange', :background_color => 'FF8C00', :foreground_color => '222222' } )
    color[ :c22 ] = TagColor.new( { :class_name => 'c22', :color_name => 'DC143C', :background_color => 'DC143C', :foreground_color => 'eeeeee' } )
    color[ :c23 ] = TagColor.new( { :class_name => 'c23', :color_name => 'deeppink', :background_color => 'FF1493', :foreground_color => '222222' } )
    color[ :c24 ] = TagColor.new( { :class_name => 'c24', :color_name => '', :background_color => 'darkmagenta', :foreground_color => 'eeeeee' } )

    color
  end
end