module TagsHelper

  def write_tag_colors
  end

  class TagColor

    attr_accessor :class_name, :color_name, :background_color, :foreground_color

    def initialize( args )
      @class_name = args[ :class_name ]
      @color_name = ''
      @background_color = ''
      @foreground_color = ''
    end

    def to_css
      css = StringIO.new
      css << ".#{@class_name}{ /* #{@color_name} */"
      css << "color:##{@foreground_color};"
      css << "background-color:##{@background_color};"
      css << "border: 1px solid ##{@background_color};}"

      css.string
    end

  end
  
  # http://www.colchis.com/clrtable.html
  TAG_COLOR_1  = TagColor.new( { :class_name => 'c1', :color_name => 'steelblue', :backround_color => '4682B4', :foreground_color => '222' } )
  TAG_COLOR_2  = TagColor.new( { :class_name => 'c2', :color_name => 'royalblue', :backround_color => '4169E1', :foreground_color => '222' } )
  TAG_COLOR_3  = TagColor.new( { :class_name => 'c3', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_4  = TagColor.new( { :class_name => 'c4', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_5  = TagColor.new( { :class_name => 'c5', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_6  = TagColor.new( { :class_name => 'c6', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_7  = TagColor.new( { :class_name => 'c7', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_8  = TagColor.new( { :class_name => 'c8', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_9  = TagColor.new( { :class_name => 'c9', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_10 = TagColor.new( { :class_name => 'c10', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_11 = TagColor.new( { :class_name => 'c11', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_12 = TagColor.new( { :class_name => 'c12', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_13 = TagColor.new( { :class_name => 'c13', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_14 = TagColor.new( { :class_name => 'c14', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_15 = TagColor.new( { :class_name => 'c15', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_16 = TagColor.new( { :class_name => 'c16', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_17 = TagColor.new( { :class_name => 'c17', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_18 = TagColor.new( { :class_name => 'c18', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_19 = TagColor.new( { :class_name => 'c19', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_20 = TagColor.new( { :class_name => 'c20', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_21 = TagColor.new( { :class_name => 'c21', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_22 = TagColor.new( { :class_name => 'c22', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_23 = TagColor.new( { :class_name => 'c23', :color_name => '', :backround_color => '', :foreground_color => '' } )
  TAG_COLOR_24 = TagColor.new( { :class_name => 'c24', :color_name => '', :backround_color => '', :foreground_color => '' } )

end